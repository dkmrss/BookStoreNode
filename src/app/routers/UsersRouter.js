const express = require("express");
const router = express.Router();
const UserModel = require("../models/UsersModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/avt/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

// Route để lấy danh sách tất cả người dùng
router.get("/get-lists", (req, res) => {
  UserModel.getAll((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết của một người dùng
router.get("/user-detail/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.getById(userId, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo một người dùng mới
router.post("/create", upload.single("avatar"), (req, res) => {
  const { email, password, name, phone, address } = req.body;
  const avatar = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newUser = { email, password, name, phone, address, avatar };

  UserModel.create(newUser, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin của một người dùng
router.put("/users/update/:id", upload.single('avatar'), (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  updatedUser.avatar = req.file ? req.file.path : ''; // Lưu đường dẫn của file ảnh vào trường avatar

  UserModel.update(userId, updatedUser, (result) => {
      res.status(200).json(result);
  });
});

// Route để xóa một người dùng
router.delete("/delete/:id", (req, res) => {
  const userId = req.params.id;
  UserModel.delete(userId, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách người dùng với giới hạn và lệch cho phân trang
router.get("/get-list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);

  UserModel.getListWithLimitOffset(take, skip, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
