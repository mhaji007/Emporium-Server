const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");


const {userById, read, update} = require("../controllers/user");

// Test route
// With this implementation once the user
// is logged in they can access (see) any
// other user's profile (much like Facebook for example)
router.get('/secret/:userId', requireSignin, (req, res) => {
  res.json({user: req.profile});
});


// Test route
// With this implementation once the user
// is logged in they cannot access (see) their own or any
// other user's profile unless they have an admin role
router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({user: req.profile});
});

// CRUD routes
router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);

// Middlewares for routes in need
// of userId and ProductId
// If userId is encountered in the url
// call the userById function in user controllers
router.param("userId", userById);


module.exports = router;
