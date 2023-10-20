import mongoose from 'mongoose';

// DB Schema
const alertSchema = new mongoose.Schema(
    {
        senderId: String,
        receiverId: String,
        alerted: { type: Boolean, default: false },
    },
    {
        statics: {
            
        }
    }
);

// Model
const Alert = mongoose.model('Alert', alertSchema);

export { Alert };