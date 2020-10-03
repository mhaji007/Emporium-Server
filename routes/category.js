const express = require("express");
const router = express.Router();

const { create, categoryById, read } = require("../controllers/category");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// CRUD routes
router.get("/category/:categoryId", read);
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);

// Middlewares for routes in need
// of userId and ProductId
router.param("category", categoryById)
router.param("userId", userById);

module.exports = router;
