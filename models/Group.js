import mongoose from 'mongoose';

// DB Schema
const groupSchema = new mongoose.Schema(
    {
        groupName: String,
        description: { type: String, default: null },
        users: {
            type: [
              {
                username: {
                  type: String,
                  required: true,
                },
                userId: {
                  type: String,
                  required: true,
                },
              },
            ],
            default: [],
          },
    },
    {
        statics: {
        }
    }
);

// Model
const Group = mongoose.model('Group', groupSchema);

export { Group };