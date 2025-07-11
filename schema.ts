import mongoose from 'mongoose';
 
const messageSchema = new mongoose.Schema({
    author: {
        type: String,
        enum: ['bot', 'user'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false }); 

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    messages: [messageSchema],
    archived: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
});
 

chatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10800 });

chatSchema.index({ sessionId: 1, archived: 1 });

chatSchema.pre('save', function(next) {
    if (this.messages.length === 0) {
        next(new Error('Messages array cannot be empty'));
    }
    next();
});

export const Chat = mongoose.model('Chat', chatSchema);
 