const studentRouter = require('./student');
const userRouter = require('./user')
module.exports = function (app) {
  app.use("/api/students", studentRouter);
  app.use("/api/users", userRouter);
};
