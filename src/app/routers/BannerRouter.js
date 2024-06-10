const express = require("express");
const router = express.Router();
const BannerModel = require("../models/BannerModel");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/Banner/"); // Thư mục để lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Tên file sẽ được lưu trữ
  },
});

const upload = multer({ storage: storage });

// Route để lấy danh sách tất cả
router.get("/get-lists", (req, res) => {
  BannerModel.getList((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết
router.get("/category-detail/:id", (req, res) => {
  const id = req.params.id;
  BannerModel.getDetail(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo mới
router.post("/create", upload.single("image"), (req, res) => {
  const { date_start, date_end, status, trash, title } = req.body;
  const image = req.file ? req.file.path : ""; // Lưu đường dẫn của file ảnh vào trường avatar

  const newBanner = { date_start, date_end, status, trash, title, image };

  BannerModel.create(newBanner, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin
router.put("/update/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const updatedBanner = req.body;
  if (req.file) {
    updatedBanner.image = req.file.path; // Lưu đường dẫn của file ảnh vào trường avatar
  }

  BannerModel.update(id, updatedBanner, (result) => {
    res.status(200).json(result);
  });
});

// Route để xóa
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  BannerModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách với giới hạn và lệch cho phân trang

// Cập nhật status
router.put("/status/:id", (req, res) => {
  const id = req.params.id;

  BannerModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Chuyển đổi trạng thái
    const newStatus = result.data.status === 0 ? 1 : 0;

    BannerModel.updateStatus(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

// Cập nhật trash
router.put("/trash/:id", (req, res) => {
  const id = req.params.id;

  BannerModel.getDetail(id, (result) => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    // Chuyển đổi trạng thái
    const newStatus = result.data.trash === 0 ? 1 : 0;

    BannerModel.updateTrash(id, newStatus, (result) => {
      res.status(result.success ? 200 : 400).json(result);
    });
  });
});

// Lấy danh sách theo status
router.get("/status/:status", (req, res) => {
  const status = req.params.status;

  BannerModel.getListByStatus(status, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

// Lấy danh sách theo trash
router.get("/trash/:trash", (req, res) => {
  const trash = req.params.trash;

  BannerModel.getListByTrash(trash, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

router.get("/get-list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const status = parseInt(req.query.status);
  const trash = parseInt(req.query.trash);
  if (status && trash) {
    const field1 = "status";
    const field2 = "trash";
    BannerModel.getListByFieldWithLimitOffset2(
      field1,
      status,
      field2,
      trash,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else if (status && !trash) {
    const field = "status";
    BannerModel.getListByFieldWithLimitOffset(
      field,
      status,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else if (!status && trash) {
    const field = "trash";
    BannerModel.getListByFieldWithLimitOffset(
      field,
      trash,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    BannerModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});

// router.get("/get-list-by-field", (req, res) => {
//   const { field, value, take, skip } = req.query;

//   if (!field || !value || !take || !skip) {
//     return res.status(400).json({
//       data: [],
//       message:
//         "Thiếu thông tin trường hoặc giá trị, hoặc số lượng kết quả hoặc vị trí bắt đầu",
//       success: false,
//       error: "Missing field, value, take, or skip parameter",
//     });
//   }

//   const takeInt = parseInt(take);
//   const skipInt = parseInt(skip);

//   if (isNaN(takeInt) || isNaN(skipInt)) {
//     return res.status(400).json({
//       data: [],
//       message: "Số lượng kết quả hoặc vị trí bắt đầu không hợp lệ",
//       success: false,
//       error: "Invalid take or skip parameter",
//     });
//   }

//   BannerModel.getListByFieldWithLimitOffset(
//     field,
//     value,
//     takeInt,
//     skipInt,
//     (result) => {
//       res.status(result.success ? 200 : 400).json(result);
//     }
//   );
// });

module.exports = router;
