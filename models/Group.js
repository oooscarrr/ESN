import mongoose from 'mongoose';

// DB Schema
const groupSchema = new mongoose.Schema(
    {
        groupName: { type: String, default: null},
        description: { type: String, default: null},
        users: { type: [String], default: [] },
    },
    {
        statics: {
        }
    }
);

// Model
const Group = mongoose.model('Group', groupSchema);

export { Group };