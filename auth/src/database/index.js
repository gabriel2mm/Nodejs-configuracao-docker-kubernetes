const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_HOST || null, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, });
mongoose.Promise = global.Promise;
module.exports = mongoose;