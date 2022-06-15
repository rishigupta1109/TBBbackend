const { validationResult } = require("express-validator");
const book = require("../models/Book");
const User = require("../models/User");
const HttpError = require("../models/Http-error");
const mongoose = require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")
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
    console.log(email);
    users = await User.findOne({ email: email });
    console.log(users);
  } catch (err) {
    return next(new HttpError("Cant get users", 500));
  }
 
  if (!users) {
    return next(new HttpError("No users found with particular email", 404));
  } else{
     let isValid;
     try {
      console.log(password,users.password)
       isValid = await bcrypt.compare(password, users.password);
     } catch (err) {
      console.log(err);
       return next(
         new HttpError("something went wrong , please try again later", 500)
       );
     }
     if (!isValid) {
       return next(new HttpError("Wrong password", 422));
     }
  } 
  let  user= users.toObject({ getters: true })
  delete user[password];
  let token;
  try {
    token = jwt.sign({ userid: users.id }, "the_book_bajaar", {
      expiresIn: "1h",
    });
  } catch (err) {
    return next(new HttpError("something went wrong,please try again", 500));
  }
  res.json({ message: "Logged in!", user,token});
};
const signup = async (req, res, next) => {
  console.log("got req");
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
  let hashedPassword;
  try{
    hashedPassword=await bcrypt.hash(password,12)
  }catch(err){
    return next(new HttpError("something went wrong , please try again later",500));
  }
  let user = new User({
    firstName,
    lastName,
    email,
    college,
    password:hashedPassword,
    books: [],
  });
  try {
    await user.save();
  } catch (err) {console.log(err)
    return next(new HttpError("cant signup", 500));
  }
  let token;
  try{
    token =jwt.sign({userid:user.id},"the_book_bajaar",{expiresIn:'1h'});
  }catch(err){
    return next(new HttpError("something went wrong,please try again",500));
  }
  res.json({ user: user.toObject({ getters: true }),token });
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
  if (existingUser.id !== req.userData.userId){
    return next(new HttpError("not authorized",401))
  }
    existingUser.firstName = firstName;
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
