const prisma = require("../util/prisma");
const fs = require("fs/promises");
const xlsx = require("xlsx");
const path = require("path");
const mime = require("mime-types");
const { student } = require("../util/prisma");

const GRADES = ["KG-1", "KG-2", "KG-3"];
const InvalidGradeError = {
  message: `Invalid grade, must be one of ${GRADES}`,
};
function isValidGrade(grade) {
  return grade !== undefined && GRADES.includes(grade.toUpperCase());
}

async function getStudents(req, res) {
  const { grade, section } = req.query;
  const users = await prisma.student.findMany({
    where: {
      grade,
      section,
    },
    orderBy: [{ name: "asc" }],
  });
  return res.send(users);
}

async function getStudent(req, res) {
  const { id } = req.params;
  try {
    const user = await prisma.student.findUnique({
      where: { id },
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
  const { name, grade, section } = req.body;
  try {
    if (!isValidGrade(grade)) {
      return res.statu(400).send(InvalidGradeError);
    }
    const user = await prisma.student.update({
      where: { id },
      data: { name, grade: grade.toUpperCase(), section },
    });
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
  const { id, name, grade, section } = req.body;
  try {
    if (!isValidGrade(grade)) {
      return res.status(400).send(InvalidGradeError);
    }
    const student = await prisma.student.create({
      data: {
        id,
        name,
        grade: grade.toUpperCase(),
        section,
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
  const errorLocationString = (student) => `Error on row ${student.__rowNum__}`;
  if (req.file === undefined) {
    return res.status(400).send({ message: "File required" });
  }
  const workbook = xlsx.read(req.file.buffer);
  const sheets = workbook.SheetNames;
  const students = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
  for (let index = 0; index < students.length; index++) {
    const student = students[index];
    // check if object has all the required object keys to be a student
    const hasAllKeys = ["id", "name", "grade", "section"].every(
      (key) => key in student
    );
    if (!hasAllKeys) {
      return res.status(400).send({
        message: `${errorLocationString(
          student
        )}: ID, Name, Grade, and Section required`,
        recieved: student,
      });
    }
    if (!isValidGrade(student.grade)) {
      return res
        .status(400)
        .send(`${errorLocationString(student)}: ${InvalidGradeError.message}`);
    }
    student.grade = student.grade.toUpperCase();
  }
  try {
    const created = await prisma.student.createMany({
      data: students,
      skipDuplicates: true,
    });
    return res.send(created);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

async function uploadAudio(req, res) {
  const { id } = req.params;
  if (req.file === undefined) {
    return res.status(400).send({ message: "Audio required" });
  }
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

async function uploadImage(req, res) {
  const { id } = req.params;
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
        image: newFileName,
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
  uploadImage,
};
