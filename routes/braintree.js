const express = require("express");
const router = express.Router();

const { requireSignin, isAuth } = require("../controllers/auth");
const {userById} = require("../controllers/user");
const {generateToken, processPayment} = require("../controllers/braintree");

// generateToken is a controller method for generating
// a token when a request is sent to the below toure
router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken)

router.post('/braintree/payment/:userId', requireSignin, isAuth, processPayment)




router.param('userId', userById);

module.exports = router
