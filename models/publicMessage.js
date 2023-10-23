import mongoose from 'mongoose';

// DB Schema
const publicMessageSchema = new mongoose.Schema(
    {
        senderName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
        userStatus: { type: String, enum: ['undefined', 'ok', 'help', 'emergency'], default: 'undefined' },
    },
    {
        statics: {
            
        }
    }
);

// Model
const PublicMessage = mongoose.model('PublicMessage', publicMessageSchema);

export { PublicMessage, publicMessageSchema};