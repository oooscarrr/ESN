import homeRouter from './homeRoutes.js';
import userRouter from './userRoutes.js';
import publicMessageRouter from './publicMessageRoutes.js';
import privateMessageRouter from './privateMessageRoutes.js';
import announcementRouter from './announcementRoutes.js';
import speedTestRouter from './speedTestRoutes.js';
import searchRouter from './searchRoutes.js';
import sosRouter from './sosRoutes.js';
import hazardRouter from './hazardRoutes.js';
import resourceRouter from './resourceRoutes.js';
import nearbyPeopleRouter from './nearbyPeopleRoutes.js';
import groupChatRouter from './groupChatRoutes.js';
import eventRouter from './eventRoutes.js';
import adminRouter from './adminRoutes.js';

export default function registerRoutes(app) {
    app.use('/', homeRouter);
    app.use('/users', userRouter);
    app.use('/messages/public', publicMessageRouter);
    app.use('/messages/private', privateMessageRouter);
    app.use('/announcements', announcementRouter);
    app.use('/speedtest', speedTestRouter);
    app.use('/search', searchRouter);
    app.use('/users/sos', sosRouter);
    app.use('/hazards', hazardRouter);
    app.use('/resources', resourceRouter);
    app.use('/nearbypeople', nearbyPeopleRouter);
    app.use('/groups', groupChatRouter);
    app.use('/events', eventRouter);
    app.use('/admin', adminRouter);
}