const express = require("express");
// Used for interaction with the database
const mongoose = require("mongoose");
// Used for printing http requests to the console
const morgan = require("morgan");

const cors = require("cors");

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
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require('./routes/order');


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

// Handle connection error
mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

// Global middlewares (to be used on all routes)
app.use(morgan('dev'));
// Send JSON responses
// app.use(bodyParser.json({ limit: "5mb", type: "application/json" }));
app.use(bodyParser.json());
// // Parses urlencoded bodies
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// Routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
app.use('/api', orderRoutes);

// Listening to Server on port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
