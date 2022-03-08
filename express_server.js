const express = require("express");
const app = express();
const PORT = 8080; //default port

const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

//Generate a random string for the shoert URL

function generateRandomString() {
  // The for loop will run 6 times because it is the convention for the other shortened URLs.
  urlLength = 6;
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for ( let i = 0; i < urlLength; i++ ) {
    randomString += characters.charAt(Math.random() * characters.length);
 }
 return randomString;
};

const urlDatabase= {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// })

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL: urlDatabase[shortURL],
    username: req.cookies["username"]}
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

// Create a short URL

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
});

//Delete route that removes a URL from the list 

app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //when a variable is a key, have to use square brackets. 
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Edit existing url

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

//It should set a cookie named username to the value submitted 
//in the request body via the login form. After our server has set the cookie it should redirect the browser back to the /urls page.

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});