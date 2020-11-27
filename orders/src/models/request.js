const mongoose = require('../database/index');

const requestSchema = new mongoose.Schema({
  user : { type: String },
  status: {
    type: String,
    enum : ['aberto','fechado', 'tecnico', 'triagem', 'dtoPagamento', 'suporte', 'atualizado', 'agendado'],
    default: 'aberto'
  },
  type : {
    type : String,
    enum: ['equipamento', 'peça', 'suporte', 'software', 'hardware'],
    default: "suporte"
  },
  equipament : { type: String },
  description : {type : String },
  isDptoPayment : Boolean,
  Approval : Boolean,
  DescriptionDeclineApproval  : String,
  DescriptionsSupport : String,
  TechnicianDescription : String,
  Scheduling : { type: Date, default: Date.now }
  
},{toJSON: { virtuals: true }});

const Request = mongoose.model("request", requestSchema);

module.exports = Request;