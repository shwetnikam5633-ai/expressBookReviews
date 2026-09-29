const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user." });
});

// Task 1 & Task 10: Get book list using async/await with Promise
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBook
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Task 3 & Task 12: Get book details based on Author using async/await with Promise
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        for (let key of bookKeys) {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push(books[key]);
          }
        }
        resolve(matchingBooks);
      });
    };
    const matched = await getBooksByAuthor();
    if (matched.length > 0) {
      return res.status(200).send(JSON.stringify(matched, null, 4));
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving author details" });
  }
});

// Task 4 & Task 13: Get all books based on Title using Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let matchingBooks = [];
    const bookKeys = Object.keys(books);
    for (let key of bookKeys) {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    }
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((matched) => res.status(200).send(JSON.stringify(matched, null, 4)))
    .catch((err) => res.status(err.status).json({ message: err.message }));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
