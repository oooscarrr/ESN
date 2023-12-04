import { Announcement } from '../models/Announcement.js';
import { User } from '../models/User.js';
import { io } from '../app.js';

/*
This function posts an accnounement from an admin and emits a socket message
- Input:
    userId (str)
    content (str)
- Output:
    status code
*/
export const post_new_announcement = async (req, res) => {
    try {
        const userId = req.userId;
        const content = req.body.content;
        const user = await User.findById(userId);
        const announcement = new Announcement({ posterName: user.username, content: content });
        io.emit('newAnnouncement', announcement);
        await announcement.save();
        res.status(201).send({ 'newAnnouncement': announcement });
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('post_new_announcement Error: ', error);
    }
}

/*
This function retrieves all announcements in descending order ranked by time posted and renders the page
- Input:
    N/A
- Output:
    An array of announcements
*/
export const list_announcements = async (req, res) => {
    // const all_announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(100).exec();
    const all_announcements = await Announcement.getDisplayableAnnouncements();
    res.render('announcements/list', { announcements: all_announcements });
}