// server.js

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('errorhandler');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(errorHandler());


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})

module.exports = app;