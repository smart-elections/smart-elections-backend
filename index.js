const express = require('express')
const app = express();

// SETUP MIDDLEWARE
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('./utils/helpers/cors')

// SETUP DOTENV
const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors);
app.use(helmet());
app.enable('trust proxy');

app.get("/", function (req, res) {
    res.send("Hello World!")
})
app.listen(8000, function () {
    console.log("Started application on port %d", 8000)
});