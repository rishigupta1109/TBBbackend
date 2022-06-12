const { validationResult } = require("express-validator");
const book = require("../models/Book");
const User = require("../models/User");
const HttpError = require("../models/Http-error");
const mongoose = require("mongoose");
const { find } = require("../models/Book");

const getAllUser = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    return next(new HttpError("Cant get users", 500));
  }
  if (!users) {
    return next(new HttpError("No users found", 404));
  }
  res.json({ users: users.map((data) => data.toObject({ getters: true })) });
};
const login = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  const { email, password } = req.body;
  let users;
  try {
    users = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Cant get users", 500));
  }
  if (!users) {
    return next(new HttpError("No users found with particular email", 404));
  } else if (users.password !== password) {
    return next(new HttpError("Wrong password", 422));
  }
  res.json({ message: "Logged in!", users: users.toObject({ getters: true }) });
};
const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, college } = req.body;
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let existingUser;
  try{
    existingUser=await User.findOne({email:email});
    console.log(existingUser);
    if(existingUser){
        return next(new HttpError("User already exist please login",422))
    }
  }catch(err){
    return next(new HttpError("cant signup", 500));
  }
  let user = new User({
    firstName,
    lastName,
    email,
    college,
    password,
    books: [],
  });
  try {
    await user.save();
  } catch (err) {console.log(err)
    return next(new HttpError("cant signup", 500));
  }
  res.json({ user: user.toObject({ getters: true }) });
};
const updateUser=async(req,res,next)=>{
    const { firstName, lastName, college,email } = req.body;
  const errors = validationResult(req);
  console.log(errors, errors.length);
  if (errors.length != undefined && errors.length !== 0) {
    console.log(errors);
    return next(new HttpError("invalid inputs", 422));
  }
  let existingUser;
  try{
    existingUser=await User.findOne({email:email});
    console.log(existingUser);
    if(!existingUser){
        return next(new HttpError("User doesnt exist please signup",422))
    }
  }catch(err){
    return next(new HttpError("cant signup", 500));
  }
  existingUser.firstName=firstName;
  existingUser.lastName=lastName;
  existingUser.college=college;
  try {
    await existingUser.save();
  } catch (err) {console.log(err)
    return next(new HttpError("cant signup", 500));
  }
  res.json({ user: existingUser.toObject({ getters: true }) });
}
exports.getAllUser = getAllUser;
exports.login = login;
exports.signup = signup;
exports.updateUser=updateUser;
