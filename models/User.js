const mongoose = require("mongoose");
const uniqValidator=require("mongoose-unique-validator");
const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true,unique:true },
  college: { type: String, required: true },
  password: { type: String, required: true },
  books: [{ type: mongoose.Types.ObjectId, required: true, ref: "Book" }],
});
userSchema.plugin(uniqValidator);
module.exports = mongoose.model("User", userSchema);
