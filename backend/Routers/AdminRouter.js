const express = require("express");
const AdminController = require("../controller/AdminController");
const router = express.Router();

// Route for registering a new admin
router.post("/register", AdminController.registerAdmin);

// Route for logging in an admin
router.post("/login", AdminController.loginAdmin);

module.exports = router;
