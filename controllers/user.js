const {
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
} = require("@prisma/client/runtime");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../util/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

async function generateToken(data) {
  return await jwt.sign(data, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

module.exports.getUserWithRole = async function (req, res) {
  const {role} = req.query;
  try {
    console.log(role);
    const user = await prisma.user.findFirst({
      where: {
        role
      },
      select: {
        id: true, username: true, fullName: true
      }
    });
    return res.send(user);
  }catch(error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

module.exports.getUsers = async function (req, res) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "staff"
      },
      orderBy: [{ username: "asc" }],
      select: {
        id:true,
        username: true,
        section: true,
        role: true,
        fullName: true
      },
    });
    return res.send(users);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log(error);
      return res
        .status(404)
        .send({ message: `Student with id ${id} not found` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
};

module.exports.addUser = async function (req, res) {
  const { username, password, section, fullName} = req.body;
  let { role } = req.body;
  if (role === undefined) {
    role = "staff";
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        fullName,
        username,
        password: hashedPassword,
        section: {
          create: { ...section },
        },
        role,
      },
      select: {
        id:true,
        username: true,
        role: true,
        section: true,
        fullName:true
      },
    });
    const token = await generateToken(user);
        return res.send({
          token,
          user: {
            username: user.username,
            role: user.role,
            section: user.section,
            fullName: user.fullName,
          },
        });

  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      console.log(error);
      return res.status(400).send(error.message);
    } else if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return res
        .status(400)
        .send({ message: "Username already exists, please try again" });
    }
    console.error(error);
    return res.sendStatus(500);
  }
};
module.exports.login = async function (req, res) {
  const ERROR = {message: "Invalid username and password"};
  const {username, password} = req.body;
  try {
    const user = await prisma.user.findUnique({where: {username},select: {id: true, username: true, role: true, password: true, section: true}});
    if (user ===null) {
      return res.status(400).send(ERROR);
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
     if (!passwordMatches) {
       return res.status(400).send(ERROR);
     }
    const token = await generateToken(user);
    return res.send({token, user: {username: user.username, role:user.role, section: user.section}})
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log(error);
      return res
        .status(404)
        .send({ message: `User with id ${id} not found` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
}

module.exports.update = async function (req, res) {
  const { id } = req.params;
  const { username, fullName, section } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        fullName,
        section: {
          update: section
        },
      },
      select: {
        id:true,
        username: true,
        section: true,
        fullName: true
      },
    });
    return res.send(user);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log(error);
      return res
        .status(404)
        .send({ message: `User with id ${id} not found` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
};

module.exports.deleteUser = async function (req, res) {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log(error);
      return res
        .status(404)
        .send({ message: `User with id ${id} not found` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
};

module.exports.changePassword = async function (req, res) {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log(error);
      return res
        .status(404)
        .send({ message: `User with id ${id} not found` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
};
