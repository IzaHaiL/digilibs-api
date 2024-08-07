const Validator = require("fastest-validator");
const { users } = require("../databases/models");
const indonesianBadwords  = require('indonesian-badwords');
const badwordsArray = require('badwords/array');
const v = new Validator();

const schema = {
  email: { type: "email", unique: true },
  username: { type: "string", min: 1, max: 255, unique: true, pattern: /^[^\s]+$/ },
  password: { type: "string", min: 1, max: 255, unique: true, pattern: /^[^\s]+$/ },
};

const check = v.compile(schema);

async function validateUser(userInput) {
  const validationResult = check(userInput);

  if (validationResult !== true) {
    return { error: validationResult };
  }

  const { email, username } = userInput;

  // Check if required fields are provided
  if (!email) {
    return { error: "Email is required" };
  }

  if (!username) {
    return { error: "Username is required" };
  }

  // Check for uniqueness in the database
  const existingEmailUser = await users.findOne({ where: { email } });
  const existingUsernameUser = await users.findOne({ where: { username } });

  if (existingEmailUser) {
    return { error: "Email already exists in the database" };
  }

  if (existingUsernameUser) {
    return { error: "Username already exists in the database" };
  }

  return { isValid: true };
}

function containsBadWords(str) {
  if (!str) {
    return false;
  }
  const containsEnglishBadWords = badwordsArray.some(word => str.includes(word));
  const containsIndonesianBadWords = indonesianBadwords.flag(str);

  return containsEnglishBadWords || containsIndonesianBadWords;
}


// Correct export statement
module.exports = { validateUser, containsBadWords };