const express = require("express");
const UsersRouter = require("./UsersRouter"); // Đường dẫn đến UsersRouter
const CategoryRouter = require("./CategoryRouter");
const BannerRouter = require("./BannerRouter");

const router = express.Router();

// Route cho các ví dụ
// Route cho người dùng
router.use("/users", UsersRouter);

// // Route cho sách
// router.use('/books', BookRouter);

// // Route cho bài viết
// router.use('/articles', ArticleRouter);

// Route cho danh mục
router.use("/category", CategoryRouter);

// Route cho banner
router.use("/banner", BannerRouter);

module.exports = router;
