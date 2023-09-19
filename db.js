const mongoose = require('mongoose');

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

// DB Schema
const User = mongoose.model('User', {
    username: String,
    password: String,
});

module.exports = {User: User};