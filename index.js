const express = require('express');
const app = express();
const { User } = require('./db');
const bcrypt = require('bcrypt');
const sequelize = require('sequelize');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send('<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>');
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  (!password) && res.send("Password is missing.");

  bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
          res.send("There is a problem hashing the password");
      } else {
          const user = await User.create({
              username: username,
              password: hash,
          });
          res.send(`successfully created user ${username}`);
      }
  });
});

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  (!password) && res.send("Password is missing.");

  const singleUser = await User.findOne({ where: { username: username } });

  if (singleUser === null) {
      res.send("User does not exist in server.");
  } else {
      const result = await bcrypt.compare(password, singleUser.password);
      result ? res.send(`successfully logged in user ${username}`) : res.send("incorrect username or password");  
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
