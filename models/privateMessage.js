import mongoose from 'mongoose';

// DB Schema
const privateMessageSchema = new mongoose.Schema(
    {
        senderId: String,
        senderName: String,
        receiverId: String,
        receiverName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
        senderStatus: { type: String, enum: ['undefined', 'ok', 'help', 'emergency'], default: 'undefined' },
    },
    {
        statics: {
            
        }
    }
);

// Model
const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

export { PrivateMessage };