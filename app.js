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

const userToSocketMap = new Map();
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
      if (!userToSocketMap.has(userId)) {
        userToSocketMap.set(userId, { count: 1, lastDisconnect: null });
        change_user_online_status(userId, true);
      } else {
        if (userToSocketMap.get(userId).lastDisconnect) {
          const timeLapse = Date.now() - userToSocketMap.get(userId).lastDisconnect;
          if (timeLapse > 5000) {
            change_user_online_status(userId, true);
          }
        }
        userToSocketMap.get(userId).count++;
      }
      console.log(userToSocketMap);
    } catch {
      console.log('Invalid token');
      socket.disconnect();
    }
  }
  socket.on('disconnect', () => {
    console.log('IO Disconnected by', socket.id);
    if (userId) {
      userToSocketMap.get(userId).count--;
      if (userToSocketMap.get(userId).count === 0) {
        userToSocketMap.get(userId).lastDisconnect = Date.now();
        setTimeout(() => {
          if (userToSocketMap.get(userId).count === 0 && userId) {
            change_user_online_status(userId, false);
            userToSocketMap.delete(userId);
          }
        }, 5000);
      }
    }
  });
});

// Connect to DB
mongoose.connect(
  `mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@fse-team-proj.6d7d7lo.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error: '));
db.once('open', function () {
  console.log('DB Connected successfully!');
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

export { server, io, authorization };