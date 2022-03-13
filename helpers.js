const getUserByEmail = function(email, database) {
  let users = database;
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

module.exports = getUserByEmail;
