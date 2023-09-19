require('./db');
const express = require('express');
const app = express();
const parser = require('body-parser');
var path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = 8000;

app.use(parser.json());
app.use(parser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

io.on('connection', () =>{
    console.log("IO Connected Successfully")
})

//routes
app.get('/', function(req, res, next) {
  res.render('home');
});

app.get('/joinCommunity', function(req, res, next) {
  res.render('joinCommunity');
});

var userRouter = require('./routes/userRoutes');
app.use('/user', userRouter);


// Start the server
server.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});