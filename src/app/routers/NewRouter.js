const express = require("express");
const router = express.Router();
const NewModel = require("../models/NewModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/News/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

// Route để lấy danh sách tất cả
router.get("/get-list", (req, res) => {
  NewModel.getList((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết
router.get("/new-detail/:id", (req, res) => {
  const id = req.params.id;
  NewModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo mới
router.post("/create", upload.single("avatar"), (req, res) => {
  const { title, short_description, content } = req.body;
  const avatar = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newNew = { title, short_description, content, avatar };

  NewModel.create(newNew, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin
router.put("/update/:id", upload.single("avatar"), (req, res) => {
  const id = req.params.id;
  const updatedNew = req.body;
  if (req.file) {
    updatedNew.avatar = req.file.path; // Lưu đường dẫn của file ảnh vào trường avatar
  }

  NewModel.update(id, updatedNew, (result) => {
    res.status(200).json(result);
  });
});

// Route để xóa
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  NewModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách với giới hạn và lệch cho phân trang
router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const status = req.query.status;
  const trash = req.query.trash;

  const fields = [];
  const values = [];

  if (status) {
    fields.push("status");
    values.push(status);
  }

  if (trash) {
    fields.push("trash");
    values.push(trash);
  }

  if (fields.length > 0) {
    NewModel.getListWithLimitOffsetByFields(fields, values, take, skip, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  } else {
    NewModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});
// Cập nhật status
router.put("/status/:id", (req, res) => {
  const id = req.params.id;

  NewModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Chuyển đổi trạng thái
    const newStatus = result.data.status === 0 ? 1 : 0;

    NewModel.updateStatus(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

// Cập nhật trash
router.put("/trash/:id", (req, res) => {
  const id = req.params.id;

  NewModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    // Chuyển đổi trạng thái
    const newStatus = result.data.trash === 0 ? 1 : 0;

    NewModel.updateTrash(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

// Lấy danh sách theo status
router.get("/status/:status", (req, res) => {
  const status = req.params.status;

  NewModel.getListByStatus(status, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

// Lấy danh sách theo trash
router.get("/trash/:trash", (req, res) => {
  const trash = req.params.trash;

  NewModel.getListByTrash(trash, (result) => {
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

  NewModel.getListByFieldWithLimitOffset(
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
