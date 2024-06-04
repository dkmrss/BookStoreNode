const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { userValidationRules, validate } = require("../validate/userValidation");

// Định nghĩa các route cho người dùng
router.post(
  "/users/create",
  userValidationRules(),
  validate,
  userController.createUser
);
router.get("/users/get-list", userController.getAllUsers);
router.get("/users/get-user/:id", userController.getUserById);
router.put(
  "/users/update-user/:id",
  userValidationRules(),
  validate,
  userController.updateUserById
);
router.delete("/users/delete/:id", userController.deleteUserById);

module.exports = router;
