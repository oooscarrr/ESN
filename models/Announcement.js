import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
        posterName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
    },
    {
        statics: {
            
        }
    }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export { Announcement, announcementSchema };