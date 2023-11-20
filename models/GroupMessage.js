import mongoose from 'mongoose';

// DB Schema
const groupMessageSchema = new mongoose.Schema(
    {
        groupId: String,
        groupName: String,
        senderName: String,
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
const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export { GroupMessage };