const express = require('express');
const path = require('path');
const logger = require('morgan');

// Internal modules
const {User, bannedUsernamesSet} = require('./models/User');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

const app = express();
const mongoose = require('mongoose');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(parser.json());
app.use(parser.urlencoded({extended: false}));
app.use(express.static(__dirname));

io.on('connection', () =>{
    console.log("IO Connected Successfully")
})
// Connect to DB
const DBPassword = "m5FKvoap498MxCVQ";
mongoose.connect(
    `mongodb+srv://gongzizan:${DBPassword}@fse-team-proj.6d7d7lo.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error: "));
db.once("open", function () {
  console.log("DB Connected successfully!");
});

// Register routes
app.use('/users', userRouter);


/*
This function validates user login info
- Input: 
    username (str)
    password (str)
- Output: 
    1. If username exists and password matches the user data in DB, return success code 1
    2. If username exists but password does not match the user data in DB, return error code 2
    3. If username does not exist and username does not meet the username rule, return error code 3
    4. If username does not exist and password does not meet the password rule, return error code 4
    5. If username does not exist and both username and password meet the rule, return success code 5
*/
app.get('/validateUserInfo', async function (req, res) {
  try {
    // Username is not case sensitive
    const username = req.query.username.toLowerCase();
    // TODO: encrypt password
    const password = req.query.password;
    const data = await User.findOne({username: username});
    if (data) {
      // User exists and password is correct
      if (data.password == password) {
        return res.send({"status": "success", "code": 1});
      // User exists but password is incorrect
      } else {
        return res.send({"status": "error", "code": 2});
      }
    }
    // User does not exist, create a new user
    // Username does not meet username rule
    if (username.length < 3 || bannedUsernamesSet.has(username)) {
      return res.send({"status": "error", "code": 3});
    }
    // Password does not meet password rule
    if (password.length < 4) {
      return res.send({"status": "error", "code": 4});
    }
    // Both username and password meet rules, return success code
    return res.send({"status": "success", "code": 5});
  } catch (error) {
      console.log(error);
  }
});

module.exports = app;
