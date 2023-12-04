import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from "cookie-parser";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import homeRouter from './routes/homeRoutes.js';
import userRouter from './routes/userRoutes.js';
import publicMessageRouter from './routes/publicMessageRoutes.js';
import privateMessageRouter from './routes/privateMessageRoutes.js';
import announcementRouter from './routes/announcementRoutes.js';
import speedTestRouter from './routes/speedTestRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import sosRouter from './routes/sosRoutes.js';
import hazardRouter from './routes/hazardRoutes.js';
import resourceRouter from './routes/resourceRoutes.js';
import nearbyPeopleRouter from './routes/nearbyPeopleRoutes.js';
import groupChatRouter from './routes/groupChatRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { change_user_online_status } from './controllers/userController.js';
import attachUserInfo from './middlewares/attachUserInfo.js';
import checkSuspended from './middlewares/checkSuspended.js';
import attachReqUrl from './middlewares/attachReqUrl.js';
import attachContext from './middlewares/attachContext.js';
import attachPrivilegeLevel from './middlewares/attachPrivilegeLevels.js';
import { User } from './models/User.js';

const app = express();
const __dirname = path.resolve();
const server = createServer(app);
const io = new Server(server);
dotenv.config();

app.locals.basedir = __dirname;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));
const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
  sameSite: 'strict',
};
app.use(cookieParser(cookieOptions));
app.use(attachUserInfo);
app.use(checkSuspended);
app.use(attachReqUrl);
app.use(attachContext);
app.use(attachPrivilegeLevel);

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const onlineUsers = {};

async function updateUserSocketId(userId, socketId) {
  try {
    await User.findByIdAndUpdate(userId, { socketId: socketId });
  } catch (error) {
    console.error('Error updating user socketId:', error);
  }
}


// Set up socket.io
io.on('connection', socket => {
  console.log('IO Connected by', socket.id);
  if (socket.handshake.headers.cookie) {  // An additional check to avoid runtime errors, double check if this is correct
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    const token = cookies.token;
    let userId;
    
    if (token) {
      try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        userId = data.id;
        if (!onlineUsers[userId]) {
          onlineUsers[userId] = 1;
          change_user_online_status(userId, true);
        } else {
          onlineUsers[userId]++;
        }
      } catch {
        console.log('Invalid token');
        socket.disconnect();
      }
    }
    console.log('momomo', userId, socket.id);
    if (userId) {
      console.log('momomo', userId, socket.id)
      updateUserSocketId(userId, socket.id);
    }

    socket.on('disconnect', () => {
      console.log('IO Disconnected by', socket.id);
      if (userId) {
        onlineUsers[userId]--;
        if (onlineUsers[userId] === 0) {
          setTimeout(() => {
            if (userId && onlineUsers[userId] === 0) {
              change_user_online_status(userId, false);
              delete onlineUsers[userId];
            }
          }, 1000);
        }
      }
    });
  }
});

// Register routes
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export { server, io, app };