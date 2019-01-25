const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const dbConnection = require("./models");
const http = require('http')
const path = require("path");
const bodyParser = require("body-parser");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
	session({
		secret: process.env.APP_SECRET || 'this is the default passphrase',
		store: new MongoStore({ mongooseConnection: dbConnection }),
		resave: false,
		saveUninitialized: false
	})
)

// Configure body parser for AJAX requests
app.use(bodyParser.urlencoded({ extended: true, limit: '3mb', parameterLimit: 3000 }));
app.use(bodyParser.json({ limit: '3mb' }));

// Serve up static assets
//UNCOMMENT ME FOR DEPLOYMENT
// app.use(express.static(path.join(__dirname, "client", "build")))
//UNCOMMENT ME FOR LOCAL
app.use(express.static("client/public"));

// Add routes, both API and view
app.use(routes);

//UNCOMMENT ME FOR DEPLOYMENT
// app.get("*", (req, res) => {  
//     res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });
//UNCOMMENT ME FOR LOCAL
app.get("*", (req, res) => {  
    res.sendFile(path.join(__dirname, "client", "public", "index.html"));
});

// Send every request to the React app
// Define any API routes before this runs
app.get("*", function(req, res) {
res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
  
var server = app.listen(PORT, function() {
console.log(`🌎 ==> Server now on port ${PORT}!`);
});

  //PUT THIS INTO package.json to go back to local
//   "start": "concurrently \"nodemon server.js\" \"npm run client\"",