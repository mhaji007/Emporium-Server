const express = require("express");
// Used for interaction with the database
const mongoose = require("mongoose");
// Used for printing http requests to the console
const morgan = require("morgan");

const bodyParser = require("body-parser");

// Used for saving users credentials in cookies
const cookieParser = require("cookie-parser");

// Used for validating user input
// (i.e., name, email and password)
const expressValidator = require('express-validator');

// Import environment variables
// dontenv.confige() should come
// before importing the routes
const dotenv = require("dotenv");
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");

// App
const app = express();


// Connect to DB
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  () => console.log("connected to DB!")
);

mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

// Routes middleware
app.use("/api", authRoutes);

// Connect Server
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
