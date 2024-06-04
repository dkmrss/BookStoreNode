const express = require("express");
const UsersRouter = require("./UsersRouter"); // Đường dẫn đến UsersRouter

const router = express.Router();

// Route cho các ví dụ
// Route cho người dùng
router.use("/users", UsersRouter);

// // Route cho sách
// router.use('/books', BookRouter);

// // Route cho bài viết
// router.use('/articles', ArticleRouter);

module.exports = router;
