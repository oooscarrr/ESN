import mongoose from 'mongoose';
import { User } from './User.js';

const announcementSchema = new mongoose.Schema({
        posterName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
    },
    {
        statics: {
            async getDisplayableAnnouncements() {
                // displayable announcements are announcements whose poster is still active
                const allAnnouncements = await this.find({}).sort({ createdAt: -1 }).limit(100).exec();
                const displayableAnnouncements = [];
                for (const announcement of allAnnouncements) {
                    const poster = await User.findByUsername(announcement.posterName);
                    if (poster && poster.isActive) {
                        displayableAnnouncements.push(announcement);
                    }
                }
                return displayableAnnouncements;
            }
            
        }
    }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export { Announcement, announcementSchema };