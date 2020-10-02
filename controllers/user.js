const User = require("../models/user");

//==== find user by Id middleware ====//

// Find user by Id
// Id is passed by the route parameter
// Helpful for when user is logged in
// and they have to be redirected to
// a userdashboard to show basic
// information such as name, description, etc.
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
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
