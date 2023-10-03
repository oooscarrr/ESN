import mongoose from 'mongoose';

// DB Schema
const publicMessageSchema = new mongoose.Schema(
    {
        senderName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
        userStatus: { type: String, enum: ['ok', 'help', 'emergency'], default: 'ok' },
    },
    {
        statics: {
            
        }
    }
);

// Model
const PublicMessage = mongoose.model('PublicMessage', publicMessageSchema);

export { PublicMessage };