
//----------------EXPRESS SERVER SETUP-----------------------------//
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//----------------FIREBASE DATABASE SETUP--------------------------//
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./firebase/key.json");

initializeApp({credential: cert(serviceAccount)});

const db = getFirestore();


//---------------FURTHER ADDITIONAL REQUIREMENTS-------------------//
const { request } = require("express");
const request1 = require("request");

app.set("view engine", "ejs");
const port = 3000;


//---------------API ENDPOINTS CREATION-----------------------------//

app.get("/", (req, res) => {
  res.render("web");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
  });

app.get("/search", (req, res) => {
    res.render("search");
});

app.get("/signup", (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const password = req.query.pwd;

  db.collection("users").add({
      name: name,
      email: email,
      password: password
    }).then(() => {
      res.render("login");
    });
});

app.get("/signin", (req, res) => {
  const email = req.query.email;
  const password = req.query.pwd;

  db.collection("users")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render("search");
      } else {
        res.render("loginfailed");
      }
    });
});


app.get("/getinfo", (req, res) => {
  const name = req.query.name;
  //res.send(name)
  var datainfo = [];
  request1(
    "https://api.nutritionix.com/v1_1/search/"+name+"?results=0:1&fields=*&appId=3261edf2&appKey=95e818f8bf3d4cb81832d2d72d38bfac",
    function (error, response, body) {
      const data = JSON.parse(body);
      var a = data.hits[0].fields.nf_calories;
      var b = data.hits[0].fields.nf_sugars;
      var c = data.hits[0].fields.nf_total_carbohydrate;
      var d = data.hits[0].fields.nf_protein;
      datainfo.push(a);
      datainfo.push(b);
      datainfo.push(c);
      datainfo.push(d);
      res.render("datainfo", { user: datainfo });
    }
  );
});

app.listen(port, () => {
  console.log(`application is running on port ${port}`);
});
