const { db } = require("../config/firebase");

const updateUserStatus = async (req, res, next) => {
  try {
      const { userId } = req.params;
          const { status } = req.body;

              if (!status) {
                    return res.status(400).json({
                            success: false,
                                    message: "Status is required",
                                          });
                                              }

                                                  await db.collection("users").doc(userId).update({ status });

                                                      res.json({
                                                            success: true,
                                                                  message: "User status updated",
                                                                      });
                                                                        } catch (error) {
                                                                            next(error);
                                                                              }
                                                                              };

                                                                              const deleteUser = async (req, res, next) => {
                                                                                try {
                                                                                    const { userId } = req.params;

                                                                                        await db.collection("users").doc(userId).delete();

                                                                                            res.json({
                                                                                                  success: true,
                                                                                                        message: "User deleted",
                                                                                                            });
                                                                                                              } catch (error) {
                                                                                                                  next(error);
                                                                                                                    }
                                                                                                                    };

                                                                                                                    module.exports = {
                                                                                                                      updateUserStatus,
                                                                                                                        deleteUser,
                                                                                                                        };