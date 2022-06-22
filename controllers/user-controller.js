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
const getUniqueColleges=async(req,res,next)=>{
  let users;
  try {
    users = await User.find();
  } catch (err) {
    return next(new HttpError("Cant get users", 500));
  }
  if (!users) {
    return next(new HttpError("No users found", 404));
  }
  const uniqueColleges=new Set();
  for(let user of users){
    console.log(user.college);
    uniqueColleges.add(user.college);
  }
  console.log(uniqueColleges);
  res.json({uniqueColleges:Array.from(uniqueColleges)});
}
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
    wishlist:[]
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
const addToWishlist=async(req,res,next)=>{
     const {userid,book } = req.body;
     const errors = validationResult(req);
     console.log(errors, errors.length);
     if (errors.length != undefined && errors.length !== 0) {
       console.log(errors);
       return next(new HttpError("invalid inputs", 422));
     }
     let existingUser;
     try {
       existingUser = await User.findOne({ _id: userid });
       console.log(existingUser);
       if (!existingUser) {
         return next(new HttpError("User doesnt exists", 422));
       }
     } catch (err) {
       return next(new HttpError("Something went wrong", 500));
     }
     if (!existingUser.wishlist.find((data)=>data.id===book.id)){
       existingUser.wishlist = [...existingUser.wishlist, book];
     }
     else{
      return next(new HttpError("book already present in wishlist",401))
     }
     try{
      await existingUser.save();
     }catch(err){
      return next(new HttpError("Something went wrong", 500));
     }
     res.json({existingUser:existingUser.toObject({getters:true})});
}
const removeFromWishlist=async(req,res,next)=>{
     const {userid,bookid } = req.body;
     const errors = validationResult(req);
     console.log(errors, errors.length);
     if (errors.length != undefined && errors.length !== 0) {
       console.log(errors);
       return next(new HttpError("invalid inputs", 422));
     }
     let existingUser;
     try {
       existingUser = await User.findOne({ _id: userid });
       console.log(existingUser);
       if (!existingUser) {
         return next(new HttpError("User doesnt exists", 422));
       }
     } catch (err) {
       return next(new HttpError("Something went wrong", 500));
     }
     existingUser.wishlist=existingUser.wishlist.filter(
       (data) => data.id !== bookid
     );
     try{
      await existingUser.save();
     }catch(err){
      return next(new HttpError("Something went wrong", 500));
     }
     res.json({existingUser:existingUser.toObject({getters:true})});
}
const getWishlist=async(req,res,next)=>{
   const userid = req.params.userid;
  let user;
  try {
    user = await User.findOne({ _id: userid });
  } catch (err) {
    return next(new HttpError("internal error in db", 500));
  }
  if (!user  ) {
    return next(new HttpError("User doesnt exists", 404));
  }
  res
    .status(200)
    .json({ wishlist: user.wishlist });
}
exports.getAllUser = getAllUser;
exports.login = login;
exports.signup = signup;
exports.updateUser=updateUser;
exports.addToWishlist=addToWishlist;
exports.removeFromWishlist=removeFromWishlist;
exports.getWishlist=getWishlist;
exports.getUniqueColleges=getUniqueColleges;
