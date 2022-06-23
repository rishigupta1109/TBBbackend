const mongoose = require("mongoose");
const notification = mongoose.Schema({
  notification: { type: Array, required: true },
  userid: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});
module.exports = mongoose.model("notification", notification);
