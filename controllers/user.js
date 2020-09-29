const User = require("../models/user");
// Used to generate signed token
const jwt = require('jsonwebtoken');
// Used for authorization check
const expressJwt = require('express-jwt');

const{errorHandler} = require("../helpers/dbErrorHandler");

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
      user
    });
  });
};

//==== Signin ====//

exports.signin = (req, res) =>{

  // Find user based on email
  const {email, password} = req.body;
  User.findOne({email}, (err, user) => {
    if(err || !user) {
      return res.status(400).json({
        err: 'No user found for this email. Please sign up.'
      })
    }
    // If user is found make sure the email and password match
    // Create authenticate method in user model
    if(!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      })
    }

    // Generate a signed token with user id and secret
    const token = jwt.sign({_id:user.id}, process.env.JWT_SECRET)
    // Persist the token as 't' in cookie with expiry date
    res.cookie('t', token, {expire:new Date() + 9999});
    // Return response with user and token to frontend client
    const {_id, name, email, role} = user;
    return res.json({token, user:{_id, email, name, role}});


  });

};

//==== Signout====//

exports.signout = (req, res) => {
  // Clear cookie from response
  res.clearCookie("t");
  res.json({message:"You have successfully signed out"});

}

//==== authentication middleware ====//

exports.requireSignin = expressJwt({
  	  secret: process.env.JWT_SECRET,
  	  algorithms: ["HS256"], // added later
  	  userProperty: "auth",
  	});

