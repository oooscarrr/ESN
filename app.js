const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const parser = require('body-parser');
var path = require('path');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine
app.set('views', path.join(path.join(__dirname, 'views')));
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
  res.render('joinCommunity');
});

// Register routes
const userRouter = require('./routes/userRoutes');
app.use('/user', userRouter);

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

module.exports = app;
