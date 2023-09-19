const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {User, bannedUsernamesSet} = require('../models/User');


/* GET users listing. */
router.get('/', function(req, res, next) {
  // TODO: actully implement this
  res.send('respond with a resource');
});

// TODO: implement all CRUD routes

/*
This function creates a new user and stores user info into the DB
- Input: 
  body: {
    username (str)
    password (str)
  }
- Output: 
    A HTTP status code
*/
router.post('/', async (req, res) => {
  try{
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({username: username, password: hashedPassword});
    const newUser = await user.save();
    res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('createNewUser Error: ', error);
  }
  finally{
    console.log('User Saved')
  }
});

module.exports = router;
