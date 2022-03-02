require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const prisma = require("./util/prisma");
const studentRouter = require("./routes/student.js");
const morgan = require("morgan");
const makeMiddleware = require("multer/lib/make-middleware");
const initRoutes = require("./routes/initRoutes");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ extended: true }));
app.use(morgan("dev"));

initRoutes(app);
app.use("/public", express.static("uploads"));

io.on("connection", (socket) => {
  console.log("A client has connected");
  socket.on("attachToClass", (className) => {
    console.log( `Joining ${className}`);
    socket.join(className);
  });
  socket.on("scan", (student) => {
    console.log(student);
    io.to(`${student.grade}:${student.section}`).emit("result",student);
  })
});

server.listen(PORT, () => {
  try {
    prisma.$connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  console.log(`API server running on port ${PORT}`);
});
