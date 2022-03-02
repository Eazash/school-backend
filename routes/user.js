const express = require('express');
const { addUser, update, getUsers, deleteUser, changePassword, login } = require('../controllers/user');
const router = express.Router();

router.post("/", addUser);
router.put("/:id", update);
router.delete("/:id", deleteUser)
router.get("/",getUsers)
router.put("/:id/changePassword", changePassword);
router.post("/login", login)

module.exports = router;