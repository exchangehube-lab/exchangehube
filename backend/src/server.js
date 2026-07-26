const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
      success: true,
          message: "ExchangeHub backend is running"
            });
            });

            const PORT = process.env.PORT || 3000;

            app.listen(PORT, () => {
              console.log(`ExchangeHub backend running on port ${PORT}`);
              });