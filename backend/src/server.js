const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const botRoutes = require("./routes/botRoutes");
const reportRoutes = require("./routes/reportRoutes");
const channelRoutes = require("./routes/channelRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/channels", channelRoutes);
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