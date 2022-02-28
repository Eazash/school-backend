const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sample = require('lodash.sample');

// add student code generation middleware

prisma.$use(async (params, next) => {
  if (params.model === "Student") {
    if(params.action === "create"){
      params.args['data'] = {...params.args['data'], code: getRandomCode()};
    }
    if(params.action === "createMany") {
      params.args['data'].forEach((student) => {
        student.code = getRandomCode();
      })
    }
  }
  return next(params)
})

function getRandomCode() {
  const codes = process.env.CODES.split(",");
  const code = sample(codes);
  return code;
}

module.exports = prisma;

module.exports.getRandomCode = getRandomCode;