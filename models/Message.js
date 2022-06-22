const mongoose = require("mongoose");


const messageSchema = mongoose.Schema({
  message: { type: String, required: true },
  from: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  to: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  room: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Messages", messageSchema);
