require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const prisma = require("./util/prisma");
const studentRouter = require("./routes/student.js");
const morgan = require("morgan");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ extended: true }));
app.use(morgan("dev"));
app.use("/api/students", studentRouter);
app.use("/public", express.static("uploads"));
app.listen(PORT, () => {
  try {
    prisma.$connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  console.log(`API server running on port ${PORT}`);
});
