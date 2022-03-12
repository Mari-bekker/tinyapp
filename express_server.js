const express = require("express");
const app = express();
const PORT = 8080; //default port

const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
const e = require("express");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
  longURL: "http://www.google.com",
  userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

///////////// HELPER METHPDS /////////////

//Generate a random string for the short URL

const generateRandomString = function() {
  // The for loop will run 6 times because it is the convention for the other shortened URLs.
  const urlLength = 6;
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < urlLength; i++) {
    randomString += characters.charAt(Math.random() * characters.length);
  }
  return randomString;
};

const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

const urlsForUser = function(id) {
  //returns the URLs where the userID is equal to the id of the currently logged-in user.
  let sortedURLS = {}
  for (const url in urlDatabase) {
    console.log(url)
    if (url === id) {
      sortedURLS[url] = urlDatabase[url] 
    }
    return sortedURLS;
  };

///////////// ROUTES /////////////

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  if (user_id) {
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_index", templateVars);

  } else {
    res.status(403).send("You must login or register first to view urls");
  }
});


app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  if (user_id) {
    res.render('urls_new', templateVars);
  }
  else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL,
    user: user};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Create a short URL/add new URL

app.post("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  if (user_id) {
    let newURL = generateRandomString();
    let userID = users[user_id].id
    urlDatabase[newURL] = { longURL: req.body.longURL, userID }
    res.redirect(`/urls/${newURL}`);
  }
  else {
    res.status(400).send("You cannot add new URLS unless you're logged in\n");
  }
});

//Delete route that removes a URL from the list

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //when a variable is a key, have to use square brackets.
  res.redirect("/urls");
});

//  /u/:id => go to the long URL from the short URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(403).send("That ID does not exist");

  }  
});


// edit existing url

app.post("/urls/:id", (req, res) => {
  let newLongURL = req.body.newLongURL;
  let shortURLID = req.params.id;
  urlDatabase[shortURLID].longURL = newLongURL;
  res.redirect("/urls");
});


// Login handling
app.post("/login", (req, res) => {
  let userEmail = req.body.email.trim();
  let userPassword = req.body.password.trim();
  let user = getUserByEmail(userEmail);
  if (!user) {
    res.status(403).send("User does not exist");
  } else if (userPassword !== user.password) {
    res.status(403).send("Incorrect password");
  } else {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  }
});

// clear the cookie on a logout

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// render register page

app.get("/register", (req, res) => {
  //const templateVars = { user: null};
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  if (user_id) {
    res.redirect('/urls/');
  }
  else {
    res.render('urls_register', templateVars);
  }
});

//registeration handler

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email.trim();
  let password = req.body.password.trim();

  if (!email || !password) {
    res.status(400).send("Email or Password can't be empty");
  } else if (getUserByEmail(email)) {
    res.status(400).send("That user already exists");
  } else {
    users[id] = { id, email, password};
  }
  res.cookie('user_id', id);
  res.redirect("/urls");
});

//login page

app.get("/login", (req, res) => {
  let user_id = req.cookies["user_id"];
  let user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  if (user_id) {
    res.redirect('/urls/');
  }
  else {
    res.render('login', templateVars);
  }
  });

