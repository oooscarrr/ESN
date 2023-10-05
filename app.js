import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import {createServer} from 'http';
import {Server} from 'socket.io';
import parser from 'body-parser';
import path from 'path';
import userRouter from './routes/userRoutes.js';
import publicMessageRouter from './routes/publicMessageRoutes.js';
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken'

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = path.resolve();

app.locals.basedir = __dirname;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

io.on('connection', () => {
    console.log('IO Connected Successfully');
});
// Connect to DB
const DBPassword = 'm5FKvoap498MxCVQ';
mongoose.connect(
    `mongodb+srv://gongzizan:${DBPassword}@fse-team-proj.6d7d7lo.mongodb.net/?retryWrites=true&w=majority`,
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

app.get('/joinCommunity', function (req, res) {
    const token = req.cookies.token;
    if (token) {
        try {
            const data = jwt.verify(token, "SecB3Rocks");
            req.userId = data.id;
            return res.redirect('/users');
        } catch {
            return res.render('joinCommunity');
        }
    }else{
        res.render('joinCommunity');
    }
});

// Add the chatroom route 
app.get('/chatroom', (req, res) => {
  res.render('chatroom'); 
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

export function authorization (req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/joinCommunity');
    }
    try {
        const data = jwt.verify(token, "SecB3Rocks");
        req.userId = data.id;
        return next();
    } catch {
        return res.redirect('/joinCommunity');
    }
};

export {server, io};