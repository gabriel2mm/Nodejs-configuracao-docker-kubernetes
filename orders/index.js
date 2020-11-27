require('dotenv/config');

const cors = require('cors');
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

//Config
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//Modules
require('./src/middleware/cors')(app)
require('./src/controller/index')(app)
require('./src/middleware/error')(app)
require('./src/middleware/notFound')(app)

//Run
const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`Orders-${process.env.ENVIRONMENT} Running on ${HOST}:${PORT}`))