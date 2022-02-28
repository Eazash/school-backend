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
  uploadImage,
  updateCode,
} = require("../controllers/student");
const upload = multer();

router.get("/", getStudents);
router.get("/:id", getStudent);
router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/import", upload.single("file"), importStudents);
router.post("/audio/:id", upload.single("file"), uploadAudio);
router.post("/image/:id", upload.single("file"), uploadImage);
router.put("/code/:id", updateCode)

module.exports = router;
