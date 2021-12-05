const prisma = require("../util/prisma");
const fs = require("fs/promises");
const xlsx = require("xlsx");
const path = require("path");
const mime = require("mime-types");

async function getStudents(req, res) {
  const users = await prisma.student.findMany();
  return res.send(users);
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
    return res.status(500);
  }
  const workbook = xlsx.read(req.file.buffer);
  const sheets = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
  const created = await prisma.student.createMany({
    data,
    skipDuplicates: true,
  });
  return res.send(created);
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

module.exports = { getStudents, addStudent, importStudents, uploadAudio };
