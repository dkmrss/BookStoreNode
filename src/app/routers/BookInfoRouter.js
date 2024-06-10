const express = require("express");
const router = express.Router();
const BookInfoModel = require("../models/BookInfo");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/BookInfo/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

// Route để lấy danh sách tất cả
router.get("/get-list", (req, res) => {
  BookInfoModel.getList((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết
router.get("/bookInfo-detail/:id", (req, res) => {
  const id = req.params.id;
  BookInfoModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo mới
router.post("/create", upload.single("book_images"), (req, res) => {
  const { types, pages, book_id } = req.body;
  const book_images = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newBookInfo = { types, pages, book_id, book_images };

  BookInfoModel.create(newBookInfo, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin
router.put("/update/:id", upload.single("book_images"), (req, res) => {
  const id = req.params.id;
  const updatedBookInfo = req.body;
  if (req.file) {
    updatedBookInfo.book_images = req.file.path; // Lưu đường dẫn của file ảnh vào trường avatar
  }

  BookInfoModel.update(id, updatedBookInfo, (result) => {
    res.status(200).json(result);
  });
});

// Route để xóa
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  BookInfoModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách với giới hạn và lệch cho phân trang
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const trash = req.query.trash;
  if (trash) {
    BookInfoModel.getListByFieldWithLimitOffset2(
      trash,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    BookInfoModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});

// Cập nhật trash
router.put("/trash/:id", (req, res) => {
  const id = req.params.id;

  BookInfoModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    // Chuyển đổi trạng thái
    const newStatus = result.data.trash === 0 ? 1 : 0;

    BookInfoModel.updateTrash(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

// Lấy danh sách theo trash
router.get("/trash/:trash", (req, res) => {
  const trash = req.params.trash;

  BookInfoModel.getListByTrash(trash, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

router.get("/get-list-by-field", (req, res) => {
  const { field, value, take, skip } = req.query;

  if (!field || !value || !take || !skip) {
    return res.status(400).json({
      data: [],
      message:
        "Thiếu thông tin trường hoặc giá trị, hoặc số lượng kết quả hoặc vị trí bắt đầu",
      success: false,
      error: "Missing field, value, take, or skip parameter",
    });
  }

  const takeInt = parseInt(take);
  const skipInt = parseInt(skip);

  if (isNaN(takeInt) || isNaN(skipInt)) {
    return res.status(400).json({
      data: [],
      message: "Số lượng kết quả hoặc vị trí bắt đầu không hợp lệ",
      success: false,
      error: "Invalid take or skip parameter",
    });
  }

  BookInfoModel.getListByFieldWithLimitOffset(
    field,
    value,
    takeInt,
    skipInt,
    (result) => {
      res.status(result.success ? 200 : 400).json(result);
    }
  );
});

module.exports = router;
