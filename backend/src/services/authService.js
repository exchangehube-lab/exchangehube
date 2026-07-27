const { db } = require("../config/firebase");

const getUser = async (uid) => {
  const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
        const error = new Error("User not found");
            error.status = 404;
                throw error;
                  }

                    return {
                        id: userDoc.id,
                            ...userDoc.data(),
                              };
                              };

                              module.exports = {
                                getUser,
                                };