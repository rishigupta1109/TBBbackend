const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  subject: { type: String, required: true },
  userid: { type: mongoose.Types.ObjectId, required: true ,ref: "User" },
});

module.exports = mongoose.model("Book", bookSchema);
