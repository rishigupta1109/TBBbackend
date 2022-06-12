const app = require("express")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const bookRoutes = require("./routes/book-routes");
const userRoutes = require("./routes/user-routes");

app.use(bodyParser.json());

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
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
