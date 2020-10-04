const express = require("express");
const router = express.Router();

const { create, productById, remove, read, update, list } = require("../controllers/product");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

// CRUD routes
router.get('/product/:productId', read)
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove);
router.put("/product/:productId/:userId", requireSignin, isAuth, isAdmin, update );
router.get("/products", list);

// Middlewares for routes in need
// of userId and ProductId
router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
