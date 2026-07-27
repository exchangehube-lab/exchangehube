const { db } = require("../config/firebase");

const deleteChannel = async (req, res, next) => {
  try {
      const { channelId } = req.params;

          await db.collection("channels").doc(channelId).delete();

              res.json({
                    success: true,
                          message: "Channel deleted",
                              });
                                } catch (error) {
                                    next(error);
                                      }
                                      };

                                      module.exports = {
                                        deleteChannel,
                                        };