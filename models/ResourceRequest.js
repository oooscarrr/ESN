import mongoose from 'mongoose';

const resourceRequestSchema = new mongoose.Schema({
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requesterName: String,
    quantity: { type: Number, default: 1, min: 1 },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'unavailable'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);

export { ResourceRequest };