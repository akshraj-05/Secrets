require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { response } = require("express");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");



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


const Schema = mongoose.Schema;
// creating schema(bluepring) for collection(table)

const userSchema = new Schema({
  email: String,
  password: String,
  googleId: String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//creating collection of schema
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
          console.error(err);
          res.redirect("/login");
      }
      else {
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
          console.error(err);
          res.redirect("/register");
      }
      else {
          passport.authenticate("local")(req, res, function () {
              res.redirect("/secrets");
          });
      }
  });

  });

///// secrets route ///
app.route("/secrets")
  .get(function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, result) {
      if (err) {
        console.error(err);
      } else {
        if (result) {
          console.log("this is the result -> " + result);
          res.render("secrets", { userWithSecrets: result });
        }
      }
    })
  })

//// logout route ///
app.route("/logout")
  .get(function (req, res) {
    req.logout(function (err) {
      if (err) {
          console.error(err);
      }
      res.redirect("/");
  });
  });

//// google authentication route //
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));


////authenticate locally and give directiong after authentication ///
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });


app.listen(3000, function () {
  console.log("server is runnig on port 3000");
});
