
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const rootRouter = require("./routes/index");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
