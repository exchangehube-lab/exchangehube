const express = require("express");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
