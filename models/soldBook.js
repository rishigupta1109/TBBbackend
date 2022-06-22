const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  subject: { type: String, required: true },
  seller: { type: String, required: true },
  college: { type: String, required: true },
  userid: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  soldOn: { type: String, required: true },
});

module.exports = mongoose.model("SoldBook", bookSchema);
