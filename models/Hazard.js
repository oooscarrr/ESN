import mongoose from 'mongoose';

// DB Schema
const HazardSchema = new mongoose.Schema(
    {
        createdAt: {type: Date, default: Date.now},
        latitude: Number,
        longitude: Number,
        details: String,
    },
    {
        statics: {
            addHazard: async function (latitude, longitude, details) {
                const newHazard = new this({latitude, longitude, details});
                return newHazard.save();
            },

            // Delete a hazard by ID
            deleteHazard: async function (hazardId) {
                return this.findByIdAndDelete(hazardId);
            },

            //Find a hazard by ID
            findHazard: async function (hazardId) {
                return this.findById(hazardId);
            },
            // Find all hazards
            findAllHazards: async function () {
                return this.find({});
            },

            deleteAllHazards: async function () {
                try {
                    const result = await this.deleteMany({});
                    console.log(`Deleted ${result.deletedCount} entries from ${this.modelName} collection.`);
                    return result;
                } catch (error) {
                    console.error(`Error deleting entries: ${error.message}`);
                    throw error;
                }
            },
        }
    }
);

// Model
const Hazard = mongoose.model('Hazard', HazardSchema);

export {Hazard, HazardSchema};