const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
// For saving users credentials in cookies
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Import routes
const userRoutes = require("./routes/user");

// App
const app = express();

dotenv.config();

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

// Routes middleware
app.use("/api", userRoutes);

// Connect Server
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
