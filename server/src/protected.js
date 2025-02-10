const express = require("express");
const authenticateToken = require("../middlewares/auth");

const router = express.Router();

// Protected Route
router.get("/", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
