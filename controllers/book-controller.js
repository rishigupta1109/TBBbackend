const { validationResult } = require("express-validator");
const book = require("../models/Book");
const User = require("../models/User");
const HttpError = require("../models/Http-error");
const mongoose = require("mongoose");

const getAllBooks = async (req, res, next) => {
  let books;
  try {
    books = await book.find();
  } catch (err) {
    return next(new HttpError("internal error in db", 500));
  }
  if (!books || books.length === 0) {
    return next(new HttpError("No books available", 404));
  }
  res.status(200).json({ books });
};

const getBookByUserId = async (req, res, next) => {
  const userid = req.params.userid;
  let books;
  try {
    books = books = await book.find({ userid: userid });
  } catch (err) {
    return next(new HttpError("internal error in db", 500));
  }
  if (!books || books.length === 0) {
    return next(new HttpError("No books available", 404));
  }
  res.status(200).json({ books });
};

const getBookById = async (req, res, next) => {
  const bookid = req.params.bookid;
  let books;
  try {
    books = await book.find({ _id: bookid });
  } catch (err) {
    return next(new HttpError("internal error in db", 500));
  }
  if (!books || books.length === 0) {
    return next(new HttpError("No books available", 404));
  }
  res.status(200).json({ books });
};
const addNewBook = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let user;
  try {
    user = await User.findOne({ _id: req.body.userid });
  } catch (err) {
    console.log(err);
    return next(new HttpError("user does not exists", 500));
  }
  if (!user) {
    return next(new HttpError("no user exist with this user id", 404));
  }
  const newBook = new book({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    subject: req.body.subject,
    userid: req.body.userid,
  });
  try {
    let sess = await mongoose.startSession();
    sess.startTransaction();
    await newBook.save({ session: sess });
    user.books.push(newBook);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Error while saving ,please try again", 500));
  }
  res.status(201).json({ newBook: newBook.toObject({ getters: true }) });
};

const updateBook = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  const bookid = req.params.bookid;
  let Book;
  try {
    Book = await book.findById(bookid);
  } catch (err) {
    return next(new HttpError("cant update", 500));
  }
  Book.name = req.body.name;
  Book.price = req.body.price;
  Book.subject = req.body.subject;
  try {
    await Book.save();
  } catch (err) {
    return next(new HttpError("cant update", 500));
  }
  res.json({ Book: Book.toObject({ getters: true }) });
};

const deleteBook = async (req, res, next) => {
  const bookid = req.params.bookid;
  let Book;
  try {
    Book = await book.findById(bookid).populate("userid");
  } catch (err) {
    return next(new HttpError("cant update", 500));
  }

  try {
    let sess = await mongoose.startSession();
    sess.startTransaction();
    await Book.remove({ session: sess });
    Book.userid.books.pull(Book);
    await Book.userid.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("cant update", 500));
  }
  res.json({ message: "removed" });
};

exports.getAllBooks = getAllBooks;
exports.getBookById = getBookById;
exports.getBookByUserId = getBookByUserId;
exports.addNewBook = addNewBook;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;
