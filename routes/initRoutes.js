const studentRouter = require('./student');
module.exports = function (app) {
  app.use("/api/students", studentRouter);
};
