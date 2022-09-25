require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


// setting views and static folder mostly this is frontend side connection
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "PleaseKeepYourSecretsAsSecrets",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//connecting with db(mongo) with mongoose

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);


const Schema = mongoose.Schema;
// creating schema(bluepring) for collection(table)

const userSchema = new Schema({
  email: String,
  password: String
});


userSchema.plugin(passportLocalMongoose);

//creating collection of schema
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


///// home route ////
app.route("/")
  .get(function (req, res) {
    res.render("home");

  })


///// login route ////
app.route("/login")
  .get(function (req, res) {
    res.render("login");

  })
  .post(function (req, res) {

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });


  });

///// register route ////
app.route("/register")
  .get(function (req, res) {
    res.render("register")

  })
  .post(function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });


  });

///// secrets route ///
app.route("/secrets")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  })

//// logout route ///
app.route("/logout")
  .get(function (req, res) {
    req.logout();
    res.redirect("/");
  });

app.listen(3000, function () {
  console.log("server is runnig on port 3000");
});
