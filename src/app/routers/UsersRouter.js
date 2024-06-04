const express = require("express");
const router = express.Router();
const UserModel = require("../models/UsersModel");

// Route để lấy danh sách tất cả người dùng
router.get("/users", (req, res) => {
  UserModel.getAll((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết của một người dùng
router.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.getById(userId, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo một người dùng mới
router.post("/users", (req, res) => {
  const newUser = req.body;
  UserModel.create(newUser, (result) => {
    res.status(201).json(result);
  });
});

// Route để cập nhật thông tin của một người dùng
router.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  UserModel.update(userId, updatedUser, (result) => {
    res.status(200).json(result);
  });
});

// Route để xóa một người dùng
router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.delete(userId, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách người dùng với giới hạn và lệch cho phân trang
router.get("/users", (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const offset = (page - 1) * limit;
  UserModel.getListWithLimitOffset(limit, offset, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
