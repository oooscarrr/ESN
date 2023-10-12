import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from "cookie-parser";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js';
import publicMessageRouter from './routes/publicMessageRoutes.js';
import { change_user_online_status } from './controllers/userController.js';
import attachUserInfo from './middlewares/attachUserInfo.js';
import { on } from 'events';

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = path.resolve();
dotenv.config();

app.locals.basedir = __dirname;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
  sameSite: 'strict',
};
app.use(cookieParser(cookieOptions));
app.use(attachUserInfo);

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const onlineUsers = {};
// Set up socket.io
io.on('connection', socket => {
  console.log('IO Connected by', socket.id);
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
});

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/joinCommunity', async function (req, res) {
  const token = req.cookies.token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = data.id;
      await change_user_online_status(req.userId, true);
      return res.redirect('/users');
    } catch {
      return res.render('joinCommunity');
    }
  } else {
    res.render('joinCommunity');
  }
});

// Register routes
app.use('/users', userRouter);
app.use('/messages/public', publicMessageRouter);

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

function authorization(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/joinCommunity');
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = data.id;
    return next();
  } catch {
    return res.redirect('/joinCommunity');
  }
};

export { server, io, authorization, app };