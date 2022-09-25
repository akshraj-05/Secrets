const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");


// setting views and static folder mostly this is frontend side connection
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//connecting with db(mongo) with mongoose

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });



const Schema = mongoose.Schema;
// creating schema(bluepring) for collection(table)

const userSchema = new Schema({
  email: String,
  password: String
});

//creating collection of schema
const User = mongoose.model("User", userSchema);



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

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
          }
        }
      }
    });
  });

///// register route ////
app.route("/register")
  .get(function (req, res) {
    res.render("register")

  })
  .post(function (req, res) {


    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });




app.listen(3000, function () {
  console.log("server is runnig on port 3000");
});
