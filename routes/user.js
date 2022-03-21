const express = require('express');
const { addUser, update, getUsers, deleteUser, changePassword, login, getUserWithRole} = require('../controllers/user');
const router = express.Router();

router.post("/", addUser);
router.put("/:id", update);
router.delete("/:id", deleteUser)
router.get("/",getUsers)
router.get("/withRole", getUserWithRole)
router.put("/:id/changePassword", changePassword);
router.post("/login", login)

module.exports = router;