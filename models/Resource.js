import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    name: String,
    description: String,
    quantity: { type: Number, default: 1 },
    availability: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    imageURL: String,
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourceRequest' }]
}, {
    statics: {

    }
});

const Resource = mongoose.model('Resource', resourceSchema);

export { Resource };