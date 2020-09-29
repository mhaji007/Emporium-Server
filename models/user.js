const mongoose = require("mongoose");
// Node module used to hash passwords
const crypto = require("crypto");
// Used to create unique strings
const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    // Virtual fields are used here
    // we take the passowrd as input from
    // the client side but we save the
    // hashed version
    hashed_password: {
      type: String,
      required: true,
    },
    // Information about user
    // used when implementing user update
    about: {
      type: String,
      trim: true,
    },
    // Used for generating the hashed password
    salt: String,
    // 0 -> user | 1 -> admin
    // By default users get a role of no-privilege user
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  // So we would automatically have created and updated at times
  { timestamps: true }
);

// Virtual field implementation

// We can add virtual fields and
// methods to userSchema in Mongoose
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  }
};

module.exports = mongoose.model("User", userSchema);
