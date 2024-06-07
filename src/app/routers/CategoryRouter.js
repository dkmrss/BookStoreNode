const express = require("express");
const router = express.Router();
const CategoryModel = require("../models/CategoryModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/Category/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

// Route để lấy danh sách tất cả
router.get("/get-lists", (req, res) => {
  CategoryModel.getAll((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết
router.get("/category-detail/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo mới
router.post("/create", upload.single("illustration"), (req, res) => {
  const { category_name } = req.body;
  const illustration = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newCategory = { category_name, illustration };

  CategoryModel.create(newCategory, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedCategory = req.body;
  CategoryModel.update(id, updatedCategory, (result) => {
    res.status(200).json(result);
  });
});

// Route để xóa
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  CategoryModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách với giới hạn và lệch cho phân trang
router.get("/get-list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);

  CategoryModel.getListWithLimitOffset(take, skip, (result) => {
    res.status(200).json(result);
  });
});

module.exports = router;
