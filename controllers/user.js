const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

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

//==== Add order to user history middleware ====//

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach(item => {
      history.push({
          _id: item._id,
          name: item.name,
          description: item.description,
          category: item.category,
          quantity: item.count,
          transaction_id: req.body.order.transaction_id,
          amount: req.body.order.amount
      });
  });

  User.findOneAndUpdate({ _id: req.profile._id }, { $push: { history: history } }, { new: true }, (error, data) => {
      if (error) {
          return res.status(400).json({
              error: 'Could not update user purchase history'
          });
      }
      next();
  });
};

//==============================================//

//==== Get user's purchase history ====//

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
      // Grab only id and name of the user
      .populate('user', '_id name')
      // sort order by created
      .sort('-created')
      .exec((err, orders) => {
          if (err) {
              return res.status(400).json({
                  error: errorHandler(err)
              });
          }
          res.json(orders);
      });
};

//==============================================//

