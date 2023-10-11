//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require('md5');
// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync("B4c0/\/", salt);
// const encrypt = require("mongoose-encryption");
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'I am the Secret',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

app.use(password.initialize());
app.use(password.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

// Serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });


// const User = new mongoose.model("User", userSchema);

app.get("/",(req,res)=>{
  res.render("home");
})

app.get("/register", function(req,res){
  res.render("register");
})

app.get("/login", (req,res)=>{
  res.render("login");
})

// app.get("/secrets", function(req, res){
//   if(req.isAuthenticated()){
//     res.render("secrets");
//   } else {
//     res.redirect("/login");
//   }
// })
// Routes
app.get('/secrets', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});
app.post('/register', function(req, res) {
  // Create a new user using Passport Local Mongoose
  User.register(
    { username: req.body.username },
    req.body.password,
    function(err, user) {
      if (err) {
        console.log(err);
        res.render('register'); // Render the registration page again on error
      } else {
        // Authenticate the user after successful registration
        passport.authenticate('local')(req, res, function() {
          res.redirect('/secrets');
        });
      }
    }
  );
});
// app.post("/register", function(req, res){
//
// User.register({username: req.body.username}, req.body.password, function(err, user){
//   if(err){
//     console.log(err);
//     res.render("/register");
//   } else {
//     passport.authentication("local")(req, res, function(){
//       res.redirect("/secrets")
//     });
//   }
// });
//
// });

// app.post("/register", function(req, res){
//   bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash(req.body.password, salt, function(err, hash) {
//         // Store hash in your password DB.
//         const newUser = new User({
//             email: req.body.username,
//             password:hash
//               // password: req.body.password
//         });
//
//         newUser.save().then(()=>{
//             res.render("secrets");
//         }).catch((err)=>{
//             console.log(err);
//         })
//     });
// });
//
// });
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username }).exec();

    if (!foundUser) {
      // User not found
      return res.redirect("/login"); // Redirect to a login error page or display an error message
    }

    bcrypt.compare(password, foundUser.password, function (err, result) {
      // Callback function for bcrypt.compare
      if (result === true) {
        // Password is valid, render secrets page
        res.render("secrets");
      } else {
        // Invalid password
        res.redirect("/login"); // Redirect to a login error page or display an error message
      }
    });
  } catch (err) {
    console.error(err);
    // Handle other errors (e.g., database connection error) here
    res.redirect("/login"); // Redirect to a login error page or display an error message
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
