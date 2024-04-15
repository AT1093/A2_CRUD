require("dotenv").config();

const currentTime = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true // Use 12-hour format (true) or 24-hour format (false)
});

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require("multer");

const connection = require("./db/connection");
connection(process.env.MONGO_URI);

const index = require('./routes/index')
const api = require('./routes/api')

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use('/', index)
app.use('/api', api)

app.use((req, res, next) => {
    res.status(404).render("404", { title: "404 Not Found", profile: null });
});

/**
 * Turn the server on by listening to a port.
 * Defaults to: http://localhost:3000
 */
app.listen({ port: process.env.PORT }, () => {
    console.log(`Server ready on port ${process.env.PORT}, current time ${currentTime}`);
});