const express = require('express');
const { addUser, updateClass, getUsers, deleteUser, changePassword, login } = require('../controllers/user');
const router = express.Router();

router.post("/", addUser);
router.put("/:id/class", updateClass);
router.delete("/:id", deleteUser)
router.get("/",getUsers)
router.put("/:id/changePassword", changePassword);
router.post("/login", login)

module.exports = router;