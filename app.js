const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')

// App
const app = express();

dotenv.config()

// Connect to DB
mongoose.connect(process.env.MONGO_URI,
  {useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  () => console.log('connected to DB!'));

mongoose.connection.on('error',
err => {
  console.log(`DB connection error: ${err.message}`)
});

// Connect Server
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
