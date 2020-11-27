const mongoose = require('../database/index');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true },
  created: { type: Date, default: Date.now },
  active : {type: Boolean, default: true}  
}, {toJSON: { virtuals: true }});

const Role = mongoose.model("role", roleSchema);

module.exports = Role;