const mongoose = require('../database/index');

const profileSchema = new mongoose.Schema({
  name : { type: String, required : true, unique: true, lowercase: true},
  roles : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "role"
  }],
  active: {type: Boolean, default : true},
  created: { type: Date, default: Date.now },
},{toJSON: { virtuals: true }});

const Profile = mongoose.model("profile", profileSchema);

module.exports = Profile;