const User = require("../models/user");

//==== find user by Id middleware ====//

// Id is passed by the route parameter
// Helpful for when user is logged in
// and they have to be redirected to
// a userdashboard to show basic
// information such as name, description, etc.
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found"
      });
    }
    // If the user is found
    // make that user available in
    // the request object on a property
    // name profile
    req.profile = user;
    next();
  });
};

//====================================//

//==== Read (find) user ====//

exports.read = (req, res) => {
  // Make sure hashed password
  // and salt are not included
  // in the response
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

//===========================//

//==== Update user ====//

exports.update = (req, res) => {
  console.log("user update", req.body);
  req.body.role = 0; // role will always be 0
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to perform this action",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

//=====================//
