const db = require("../configs/database");
const userSchema = require("../schemas/UsersSchema");
class UserModel {
  static getAll(callback) {
    db.query("SELECT * FROM users", (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách người dùng",
          success: false,
          error: err.message,
          totalCount: 0,
        });
      }
      callback({
        data: rows,
        message: "Danh sách người dùng đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    });
  }

  static getById(id, callback) {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
      if (err) {
        return callback({
          data: {},
          message: "Không thể lấy thông tin người dùng",
          success: false,
          error: err.message,
        });
      }
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy người dùng",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin người dùng đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }

  static create(newUser, callback) {
    const { email, password, name, phone, address, avatar } = newUser;
    const { error } = userSchema.validate(newUser);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    // Kiểm tra email trùng
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Lỗi khi kiểm tra email",
          success: false,
          error: err.message,
        });
      }
      if (rows.length > 0) {
        return callback({
          data: [],
          message: "Email đã tồn tại",
          success: false,
          error: "Email already exists.",
        });
      }

      // Thêm người dùng mới
      db.query(
        "INSERT INTO users SET ?",
        { email, password, name, phone, address, avatar },
        (err, result) => {
          if (err) {
            return callback({
              data: [],
              message: "Không thể thêm người dùng",
              success: false,
              error: err.message,
            });
          }
          callback({
            data: result.insertId,
            message: "Người dùng đã được thêm thành công",
            success: true,
            error: "",
          });
        }
      );
    });
  }

  static update(id, updatedUser, callback) {
    // Lấy thông tin người dùng hiện tại
    db.query('SELECT avatar FROM users WHERE id = ?', [id], (err, rows) => {
        if (err) {
            return callback({
                data: [],
                message: "Không thể lấy thông tin người dùng",
                success: false,
                error: err.message,
            });
        }
        if (rows.length === 0) {
            return callback({
                data: [],
                message: "Không tìm thấy người dùng",
                success: false,
                error: "",
            });
        }
        
        // Giữ lại giá trị avatar hiện tại nếu không có tệp được tải lên
        if (!updatedUser.avatar) {
            updatedUser.avatar = rows[0].avatar;
        }

        db.query('UPDATE users SET ? WHERE id = ?', [updatedUser, id], (err, result) => {
            if (err) {
                return callback({
                    data: [],
                    message: "Không thể cập nhật thông tin người dùng",
                    success: false,
                    error: err.message,
                });
            }
            if (result.affectedRows === 0) {
                return callback({
                    data: [],
                    message: "Không tìm thấy người dùng để cập nhật",
                    success: false,
                    error: "",
                });
            }
            callback({
                data: id,
                message: "Thông tin người dùng đã được cập nhật thành công",
                success: true,
                error: "",
            });
        });
    });
}


  static delete(id, callback) {
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể xóa người dùng",
          success: false,
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy người dùng để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Người dùng đã được xóa thành công",
        success: true,
        error: "",
      });
    });
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM users LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM users";

    db.query(query, [limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách người dùng",
          success: false,
          error: err.message,
          totalCount: 0,
        });
      }

      db.query(countQuery, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng người dùng",
            success: false,
            error: err.message,
            totalCount: 0,
          });
        }

        const totalCount = countResult[0].totalCount;

        callback({
          data: rows,
          message: "Danh sách người dùng đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }
}

module.exports = UserModel;
