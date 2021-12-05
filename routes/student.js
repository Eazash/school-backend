const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getStudents,
  addStudent,
  importStudents,
  uploadAudio,
  getStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/student");
const upload = multer();

router.get("/", getStudents);
router.get("/:id", getStudent);
router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/import", upload.single("file"), importStudents);
router.post("/audio", upload.single("audio"), uploadAudio);

module.exports = router;
