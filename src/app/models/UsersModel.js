const db = require("../configs/database");
const userSchema = require("../schemas/UsersSchema");
const fs = require("fs");
const path = require("path");

class UserModel {
  static executeQuery(query, params, successMessage, errorMessage, callback) {
    db.query(query, params, (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: errorMessage,
          success: false,
          error: err.message,
        });
      }
      callback({
        data: result,
        message: successMessage,
        success: true,
        error: "",
      });
    });
  }

  static getAll(callback) {
    this.executeQuery(
      "SELECT * FROM users",
      [],
      "Danh sách người dùng đã được lấy thành công",
      "Không thể lấy danh sách người dùng",
      (result) => {
        callback({
          ...result,
          totalCount: result.data.length,
        });
      }
    );
  }

  static getById(id, callback) {
    this.executeQuery(
      "SELECT * FROM users WHERE id = ?",
      [id],
      "Thông tin người dùng đã được lấy thành công",
      "Không thể lấy thông tin người dùng",
      (result) => {
        if (result.data.length === 0) {
          return callback({
            data: {},
            message: "Không tìm thấy người dùng",
            success: false,
            error: "",
          });
        }
        callback({
          data: result.data[0],
          message: result.message,
          success: result.success,
          error: result.error,
        });
      }
    );
  }

  static handleImageCleanup(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  static handleValidationError(newUser, callback, error) {
    if (newUser.avatar) {
      const imagePath = path.join(__dirname, "..", "..", "..", newUser.avatar);
      this.handleImageCleanup(imagePath);
    }
    return callback({
      data: [],
      message: "Dữ liệu không hợp lệ",
      success: false,
      error: error.details[0].message,
    });
  }

  static create(newUser, callback) {
    const { email, password, name, phone, address, avatar } = newUser;
    const { error } = userSchema.validate(newUser);
    if (error) {
      return this.handleValidationError(newUser, callback, error);
    }

    // Kiểm tra email trùng
    this.executeQuery(
      "SELECT * FROM users WHERE email = ?",
      [email],
      "",
      "Lỗi khi kiểm tra email",
      (result) => {
        if (result.data.length > 0) {
          return this.handleValidationError(newUser, callback, { details: [{ message: "Email đã tồn tại" }] });
        }

        // Thêm người dùng mới
        this.executeQuery(
          "INSERT INTO users SET ?",
          { email, password, name, phone, address, avatar },
          "Người dùng đã được thêm thành công",
          "Không thể thêm người dùng",
          (insertResult) => {
            callback({
              data: insertResult.data.insertId,
              message: insertResult.message,
              success: insertResult.success,
              error: insertResult.error,
            });
          }
        );
      }
    );
  }

  static update(id, updatedUser, callback) {
    // Lấy thông tin người dùng hiện tại
    this.executeQuery(
      "SELECT avatar FROM users WHERE id = ?",
      [id],
      "",
      "Không thể lấy thông tin người dùng",
      (result) => {
        if (result.data.length === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy người dùng",
            success: false,
            error: "",
          });
        }

        if (!updatedUser.avatar) {
          updatedUser.avatar = result.data[0].avatar;
        }

        this.executeQuery(
          "UPDATE users SET ? WHERE id = ?",
          [updatedUser, id],
          "Thông tin người dùng đã được cập nhật thành công",
          "Không thể cập nhật thông tin người dùng",
          (updateResult) => {
            if (updateResult.data.affectedRows === 0) {
              return callback({
                data: [],
                message: "Không tìm thấy người dùng để cập nhật",
                success: false,
                error: "",
              });
            }
            callback({
              data: id,
              message: updateResult.message,
              success: updateResult.success,
              error: updateResult.error,
            });
          }
        );
      }
    );
  }

  static delete(id, callback) {
    this.executeQuery(
      "DELETE FROM users WHERE id = ?",
      [id],
      "Người dùng đã được xóa thành công",
      "Không thể xóa người dùng",
      (result) => {
        if (result.data.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy người dùng để xóa",
            success: false,
            error: "",
          });
        }
        callback({
          data: id,
          message: result.message,
          success: result.success,
          error: result.error,
        });
      }
    );
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM users LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM users";

    this.executeQuery(query, [limit, offset], "", "Không thể lấy danh sách người dùng", (result) => {
      if (!result.success) {
        return callback(result);
      }

      this.executeQuery(countQuery, [], "", "Không thể đếm số lượng người dùng", (countResult) => {
        if (!countResult.success) {
          return callback(countResult);
        }

        callback({
          data: result.data,
          message: "Danh sách người dùng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: countResult.data[0].totalCount,
        });
      });
    });
  }
}

module.exports = UserModel;
