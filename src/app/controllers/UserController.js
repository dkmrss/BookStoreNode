// userController.js

const { connectDB } = require("../configs/database");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// Kết nối đến cơ sở dữ liệu MongoDB
connectDB();

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, phone, address, avatar } = req.body;

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      address,
      avatar,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      data: users,
      success: true,
      error: "",
      message: "lấy dữ liệu thành công",
      totalCount: users.length,
    });
  } catch (error) {
    res.status(500).json({
      data: [],
      message: "Lỗi khi lấy dữ liệu",
      error: error.message,
      totalCount: 0,
      success: false,
    });
  }
};

// Lấy người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        data: [],
        message: "Không tìm thấy người dùng",
        success: true,
        error: "",
      });
    }
    res.status(200).json({
      data: user,
      success: true,
      error: "",
      message: "lấy dữ liệu thành công",
    });
  } catch (error) {
    res.status(500).json({
      data: [],
      message: "Lỗi truy vấn",
      success: false,
      error: error.message,
    });
  }
};

// Cập nhật người dùng theo ID
exports.updateUserById = async (req, res) => {
  try {
    const { email, password, name, phone, address, avatar, status, role } =
      req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, password, name, phone, address, avatar, status, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        data: [],
        message: "Không tìm thấy người dùng",
        success: true,
        error: "",
      });
    }
    res.status(200).json({ message: "User updated successfully", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

// Xóa người dùng theo ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        data: [],
        message: "Không tìm thấy người dùng",
        success: true,
        error: "",
      });
    }
    res
      .status(200)
      .json({ message: "Xoá người dùng thành công", success: true, error: "" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Xoá người dùng thất bại",
        success: false,
        error: error.message,
      });
  }
};
