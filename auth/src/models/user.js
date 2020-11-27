const mongoose = require('../database/index');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, lowercase: true },
  last_name: { type: String, required: true, lowercase: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  login: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  created: { type: Date, default: Date.now },
  profile: { type: mongoose.Types.ObjectId, ref: "profile" }
}, {toJSON: { virtuals: true }});

const User = mongoose.model("user", userSchema);

module.exports = User;