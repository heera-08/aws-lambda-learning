import mongoose from 'mongoose';
 
let isConnected = false;
 
const uri = process.env.MONGODB_URI ?? 'mongodb+srv://heerayashmin:SAEmfNtbm0LMJFuE@aws-lambda-cluster.ji0s5xu.mongodb.net/?retryWrites=true&w=majority&appName=aws-lambda-cluster';
 
if (!uri) {
    throw new Error("Missing MONGODB_URI");
}
 
export async function connectToDatabase() {
    if (isConnected) {
        console.log("Using existing database connection");
        return mongoose.connection;
    }
    
    try {
        // Configure mongoose for Lambda environment
        mongoose.set('bufferCommands', false);
      
        
        const connection = await mongoose.connect(uri, {
            // serverSelectionTimeoutMS: 5000, 
            // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            // maxPoolSize: 10, // Maintain up to 10 socket connections
            // minPoolSize: 5, // Maintain at least 5 socket connections
            // maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
            dbName: "aws-lambda-L"
        });
        
        isConnected = true;
        console.log("Database connected successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });
        
        return connection;
        
    } catch (error) {
        console.error("Database connection failed:", error);
        isConnected = false;
        throw error;
    }
}