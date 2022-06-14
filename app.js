const express=require('express');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs=require("fs");
const path=require("path");
const bookRoutes = require("./routes/book-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/Http-error");
var cors = require("cors");


app.use(bodyParser.json());
app.use('/uploads/images',express.static(path.join('uploads','images')));
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   // res.setHeader(
//   //   "Access-Control-Allow-Headers",
//   //   "Origin , X-Requested-With,Content-Type,Accept,Authorization"
//   // );
//   // res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
// });
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use((req, res, next) => {
  return next(new HttpError("could not find this route", 404));
});
app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path ,err=>console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "an unknown error occured" });
});

mongoose
  .connect(
    "mongodb+srv://admin:admin123@cluster0.rzlym.mongodb.net/tbb?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });
