"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const cookieSession = require('cookie-session');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const mapsRoutes = require("./routes/maps");
const favouritesRoutes = require("./routes/favourites");
const contributionsRoutes = require("./routes/contributions");
const markersRoutes = require("./routes/markers");
const loginRoutes = require("./routes/login");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: false
}));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/api/maps", mapsRoutes(knex));
app.use("/api/favourites", favouritesRoutes(knex));
app.use("/api/contributions", contributionsRoutes(knex));

app.use("/api/markers", markersRoutes(knex));

// Mount routes
app.use("/login", loginRoutes());



// Home page
app.get("/", (req, res) => {
  res.render("index");
});

//TODO: Delete this section and convert to SPA on completion
// User profile
app.get("/users/:username", (req, res) => {
  res.render("user_profile");
});

// View/edit map
app.get("/maps/:id", (req, res) => {
  res.render("show_map");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
