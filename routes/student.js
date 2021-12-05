const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getStudents,
  addStudent,
  importStudents,
  uploadAudio,
} = require("../controllers/student");
const upload = multer();

router.get("/", getStudents);
router.post("/", addStudent);
router.post("/import", upload.single("file"), importStudents);
router.post("/audio", upload.single("audio"), uploadAudio);

module.exports = router;
