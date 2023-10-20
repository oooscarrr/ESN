const bcrypt = require('bcrypt');
const { bannedUsernamesSet } = require('../models/User');

function validateUsername(username) {
    // Check if meets the length requirement
    if (username.length < 3) return false;

    // Ensure username is not in the banned list
    if (bannedUsernamesSet.has(username.toLowerCase())) return false;

    return true;
}

function validatePassword(password) {
  return password.length >= 4;
}

async function validateLogin(username, password, user) {
  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return 1; // Success code 1
    } else {
      return 2; // Error code 2
    }
  } else {
    if (validateUsername(username) && validatePassword(password)) {
      return 5; // Success code 5
    } else {
      return 4; // Error code 4
    }
  }
}

module.exports = {
  validateUsername,
  validatePassword,
  validateLogin,
};
