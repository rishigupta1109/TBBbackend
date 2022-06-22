const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  id: { type: String, required: true },
  user1: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  name1: { type: String, required: true },
  name2: { type: String, required: true },
  user2: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Rooms", roomSchema);
