const express = require("express");
const app = express();
const PORT = 8080; //default port

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]}
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  console.log("before the redirect");  //testing if this post gets triggered
  res.redirect(`/urls/${newURL}`);
});

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
