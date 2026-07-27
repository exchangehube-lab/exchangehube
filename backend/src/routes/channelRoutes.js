const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const { validateId } = require("../middleware/validate");
const { deleteChannel } = require("../controllers/channelController");

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.delete(
  "/:channelId",
    validateId("channelId"),
      deleteChannel
      );

      module.exports = router;