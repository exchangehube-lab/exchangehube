const { db } = require("../config/firebase");

const updateBotStatus = async (req, res, next) => {
  try {
      const { botId } = req.params;
          const { status } = req.body;

              const allowedStatuses = ["approved", "rejected", "suspended"];

                  if (!allowedStatuses.includes(status)) {
                        return res.status(400).json({
                                success: false,
                                        message: "Invalid bot status",
                                              });
                                                  }

                                                      await db.collection("bots").doc(botId).update({ status });

                                                          res.json({
                                                                success: true,
                                                                      message: "Bot status updated",
                                                                          });
                                                                            } catch (error) {
                                                                                next(error);
                                                                                  }
                                                                                  };

                                                                                  const deleteBot = async (req, res, next) => {
                                                                                    try {
                                                                                        const { botId } = req.params;

                                                                                            await db.collection("bots").doc(botId).delete();

                                                                                                res.json({
                                                                                                      success: true,
                                                                                                            message: "Bot deleted",
                                                                                                                });
                                                                                                                  } catch (error) {
                                                                                                                      next(error);
                                                                                                                        }
                                                                                                                        };

                                                                                                                        module.exports = {
                                                                                                                          updateBotStatus,
                                                                                                                            deleteBot,
                                                                                                                            };