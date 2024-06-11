const express = require("express");
const router = express.Router();
const UserCommentModel = require("../models/UserComment");
const multer = require("multer");

// Route để lấy danh sách tất cả bình luận của người dùng
router.get("/get-list", (req, res) => {
  UserCommentModel.getAll((result) => {
    res.status(200).json(result);
  });
});

// Route để lấy thông tin chi tiết của một bình luận của người dùng
router.get("/comment-detail/:id", (req, res) => {
  const id = req.params.id;
  UserCommentModel.getById(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để tạo một bình luận của người dùng mới
router.post("/create", (req, res) => {
  const { book_id, user_id, content } = req.body;
  const newComment = { book_id, user_id, content };
  UserCommentModel.create(newComment, (result) => {
    res.json(result);
  });
});

// Route để cập nhật thông tin của một bình luận của người dùng
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedComment = req.body;
  UserCommentModel.update(id, updatedComment, (result) => {
    res.status(result.success ? 200 : 400).json(result);
  });
});

// Route để xóa một bình luận của người dùng
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  UserCommentModel.delete(id, (result) => {
    res.status(200).json(result);
  });
});

// Route để lấy danh sách bình luận của người dùng với giới hạn và lệch cho phân trang
router.get("/get-list", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);

  UserCommentModel.getListWithLimitOffset(take, skip, (result) => {
    res.status(200).json(result);
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

  UserCommentModel.getListWithLimitOffsetByField(
    field,
    value,
    takeInt,
    skipInt,
    (result) => {
      res.status(result.success ? 200 : 400).json(result);
    }
  );
});

router.get("/get-lists", (req, res) => {
  const take = parseInt(req.query.take);
  const skip = parseInt(req.query.skip);
  const bookId = req.query.bookId;
  const userId = req.query.userId;
  if (bookId && userId) {
    UserCommentModel.getListWithLimitOffsetByField2(
      bookId,
      userId,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else if (bookId && !userId) {
    const field = "book_id";
    UserCommentModel.getListWithLimitOffsetByField(
      field,
      bookId,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else if (!bookId && userId) {
    const field = "user_id";
    UserCommentModel.getListWithLimitOffsetByField(
      field,
      userId,
      take,
      skip,
      (result) => {
        res.status(result.success ? 200 : 400).json(result);
      }
    );
  } else {
    UserCommentModel.getListWithLimitOffset(take, skip, (result) => {
      res.status(200).json(result);
    });
  }
});

module.exports = router;
