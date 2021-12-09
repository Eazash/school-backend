const prisma = require("../util/prisma");
const fs = require("fs/promises");
const xlsx = require("xlsx");
const path = require("path");
const mime = require("mime-types");

async function getStudents(req, res) {
  const users = await prisma.student.findMany();
  return res.send(users);
}

async function getStudent(req, res) {
  const { id } = req.params;
  try {
    const user = await prisma.student.findUnique({
      where: { id },
      orderBy: [{ createdAt: "asc" }],
    });
    if (user === null) {
      return res.sendStatus(404);
    }
    return res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const user = await prisma.student.update({ where: { id }, data: { name } });
    return res.send(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(400)
        .send({ message: `Student with ID (${id}) does not exist` });
    }
    console.log(error);
    return res.sendStatus(500);
  }
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(400)
        .send({ message: `Student with ID (${id}) does not exist` });
    }
  }
}

async function addStudent(req, res) {
  const { id, name } = req.body;
  try {
    const student = await prisma.student.create({
      data: {
        id,
        name,
      },
    });
    return res.send(student);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .send({ message: `Student with ID (${id}) already exists` });
    }
    console.error(error);
    return res.sendStatus(500);
  }
}

async function importStudents(req, res) {
  if (req.file === undefined) {
    return res.sendStatus(500);
  }
  const workbook = xlsx.read(req.file.buffer);
  const sheets = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
  try {
    const created = await prisma.student.createMany({
      data,
      skipDuplicates: true,
    });
    return res.send(created);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function uploadAudio(req, res) {
  const { id } = req.body;
  const { buffer, originalname, mimetype } = req.file;
  const newFileName = `${Date.now()}${
    path.extname(originalname) || `.${mime.extension(mimetype)}`
  }`;
  const filePath = path.join(process.cwd(), "uploads", newFileName);
  try {
    let student = await prisma.student.findUnique({
      where: { id },
    });
    await fs.writeFile(filePath, buffer);
    student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        audio: newFileName,
      },
    });
    return res.send(student);
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(400)
        .send({ message: `Student with ID (${id}) does not exist` });
    }
    console.error(error);
    // await fs.unlink(filePath);
    return res.sendStatus(500);
  }
}

module.exports = {
  getStudent,
  getStudents,
  addStudent,
  updateStudent,
  importStudents,
  uploadAudio,
  deleteStudent,
};
