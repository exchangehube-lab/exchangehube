const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const { validateId } = require("../middleware/validate");
const {
  updateBotStatus,
    deleteBot,
    } = require("../controllers/botController");

    const router = express.Router();

    router.use(authenticate);
    router.use(requireAdmin);

    router.patch(
      "/:botId/status",
        validateId("botId"),
          updateBotStatus
          );

          router.delete(
            "/:botId",
              validateId("botId"),
                deleteBot
                );

                module.exports = router;