const mongoose = require('../database/index');

const orderSchema = new mongoose.Schema({
  queue: {
    type: String,
    enum : ['triagem','nivel2', 'tecnico', 'requisitante', 'dtoPagamento'],
    default: 'requisitante'
  },
  description : {type : String },
  attachment: 
  { 
    type: String
  },
  request : { type: mongoose.Types.ObjectId, ref: "request" },
  user : { type: String },
  
},{toJSON: { virtuals: true }});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;