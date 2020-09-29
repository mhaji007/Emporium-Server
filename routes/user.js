const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/user");
const { signin } = require("../controllers/user");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);

module.exports = router;
