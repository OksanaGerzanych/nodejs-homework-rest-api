const express = require("express");

const router = express.Router();
const usersController = require("../../controllers/users");
const { authenticate } = require("../../middlewares");

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/current", authenticate, usersController.getCurrent);
module.exports = router;
