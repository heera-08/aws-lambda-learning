import { successResponse, errorResponse } from './utils/util.js';
import { connectToDatabase } from './mongoClient.js';
import { Chat } from './schema.js';
export const handler = async (event) => {
    console.log("HTTP method:", event.httpMethod);
    console.log("Path:", event.path);
    console.log("Body:", event.body);
    console.log("Headers:", JSON.stringify(event.headers));
    const { httpMethod, path } = event;
    //const trimmedPath = path.replace(/\/$/, '');
    
    try {
        console.log(path);
        if (httpMethod === 'POST' && path === '/requesting') {
            console.log("Matched POST /requesting");
            if (!event.body) {
                return errorResponse("Missing request body", 400);
            }
            let parsedBody;
            try {
                parsedBody = JSON.parse(event.body);
            }
            catch {
                return errorResponse("Invalid JSON format in request body", 400);
            }
            const { sessionId, messages } = parsedBody;
            if (typeof sessionId !== 'string' || !Array.isArray(messages)) {
                return errorResponse("Invalid input: sessionId must be a string and messages must be an array", 400);
            }
            console.log(' before DB')
            await connectToDatabase();
            const chat = new Chat({
                sessionId,
                messages,
                archived: false
            });
            await chat.save();
            return successResponse({ message: "Chat created successfully", chat });
        }
        console.log('hi')
        return errorResponse("Not found", 404);
    }
    catch (error) {
        console.error("Error during Lambda execution:", error);
        return errorResponse("Internal server error", 500);
    }
    console.log('hello')
};


import mongoose from 'mongoose'; //npm install mongoose
const messageSchema = new mongoose.Schema({
    author: { type: String, enum: ['bot', 'user'], required: true },
    content: { type: String, required: true }
});
const chatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    messages: [messageSchema],
    archived: { type: Boolean, default: false }
}, { timestamps: true });
// TTL index to auto-delete documents after 3 hour
chatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10800 });
// const archiveSchema = new mongoose.Schema({
//   sessionId: String,
//   messages: [messageSchema],
//   archived: { type: Boolean, default: true },
//   createdAt: Date,
//   updatedAt: Date
// });
export const Chat = mongoose.model('Chat', chatSchema);
// export const Archive = mongoose.model('Archive', archiveSchema);


import { MongoClient } from 'mongodb';
let cachedClient = null;
const uri = process.env.MONGODB_URI ?? 'mongodb+srv://heerayashmin:SAEmfNtbm0LMJFuE@aws-lambda-cluster.ji0s5xu.mongodb.net/?retryWrites=true&w=majority&appName=aws-lambda-cluster';
if (!uri) {
    throw new Error("Missing MONGODB_URI ");
}
export async function connectToDatabase() {
    if (cachedClient) {
        console.log("connected 1");
        return cachedClient.db("aws-lambda-L");
    }
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    console.log("DB Connected successfully");
    return client.db("aws-lambda-L");
}
