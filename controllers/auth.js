const User = require("../models/user");
// Used to generate signed token
const jwt = require("jsonwebtoken");
// Used for authorization check
const expressJwt = require("express-jwt");

const { errorHandler } = require("../helpers/dbErrorHandler");

//==== Signup ====//

exports.signup = (req, res) => {

  console.log("req.body", req.body);

  const user = new User(req.body);

  user.save((err, user) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        err: errorHandler(err)
      });
    }

    user.salt = undefined;
    user.hashed_password = undefined;

    res.json({
      user,
    });
  });
};

//=================//

//==== Signin ====//

exports.signin = (req, res) => {
  // Find user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No user found for this email. Please sign up."
      });
    }
    // If user is found make sure the email and password match
    // Create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    // Generate a signed token with user id and secret
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
    // Persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // Return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

//=================//

//==== Signout====//

exports.signout = (req, res) => {
  // Clear cookie from response
  res.clearCookie("t");
  res.json({ message: "You have successfully signed out" });
};

//================//

//==== Authentication middleware ====//

// Protects routes for any authenticated user
// Being logged in is enough to acess
// both own and others' profile
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth"
});

//==== User specific authentication middleware ====//

// Protects routes for currently authenticated user
// Logged-in user (req.profile) and currently authenticated user
// (req.auth._id) must have the same id
exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied"
    });
  }
  next();
};

//==== Role specific authentication middleware ====//

// Protects routes for admin
// Own and other's profile may only be accessed
// if the user has admin role
exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin only resource! Access denied"
    });
  }
  next();
};

//=================//
