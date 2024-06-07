const db = require("../configs/database");
const bannerSchema = require("../schemas/BannerSchema");

class BannerModel {
  static getList(callback) {
    db.query("SELECT * FROM banner", (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách banner",
          success: false,
          error: err.message,
          totalCount: 0,
        });
      }
      callback({
        data: rows,
        message: "Danh sách banner đã được lấy thành công",
        success: true,
        error: "",
        totalCount: rows.length,
      });
    });
  }

  static getDetail(id, callback) {
    db.query("SELECT * FROM banner WHERE id = ?", [id], (err, rows) => {
      if (err) {
        return callback({
          data: {},
          message: "Không thể lấy thông tin banner",
          success: false,
          error: err.message,
        });
      }
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy banner",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin banner đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM banner LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM banner";
    db.query(query, [limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách banner",
          success: false,
          error: err.message,
          totalCount: 0,
        });
      }

      db.query(countQuery, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng banner",
            success: false,
            error: err.message,
            totalCount: 0,
          });
        }

        const totalCount = countResult[0].totalCount;

        callback({
          data: rows,
          message: "Danh sách banner đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static create(newBanner, callback) {
    const { error } = bannerSchema.validate(newBanner);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    db.query("INSERT INTO banner SET ?", newBanner, (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể thêm banner",
          success: false,
          error: err.message,
        });
      }
      callback({
        data: result.insertId,
        message: "Banner đã được thêm thành công",
        success: true,
        error: "",
      });
    });
  }

  static update(id, updatedBanner, callback) {
    // Lấy thông tin danh mục hiện tại
    db.query("SELECT image FROM banner WHERE id = ?", [id], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy thông tin danh mục",
          success: false,
          error: err.message,
        });
      }
      if (rows.length === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy danh mục",
          success: false,
          error: "",
        });
      }

      // Giữ lại giá trị avatar hiện tại nếu không có tệp được tải lên
      if (!updatedBanner.image) {
        updatedBanner.image = rows[0].image;
      }

      db.query(
        "UPDATE banner SET ? WHERE id = ?",
        [updatedBanner, id],
        (err, result) => {
          if (err) {
            return callback({
              data: [],
              message: "Không thể cập nhật banner",
              success: false,
              error: err.message,
            });
          }
          if (result.affectedRows === 0) {
            return callback({
              data: [],
              message: "Không tìm thấy banner dùng để cập nhật",
              success: false,
              error: "",
            });
          }
          callback({
            data: id,
            message: "Thông tin banner đã được cập nhật thành công",
            success: true,
            error: "",
          });
        }
      );
    });
  }

  static delete(id, callback) {
    db.query("DELETE FROM banner WHERE id = ?", [id], (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể xóa banner",
          success: false,
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy banner để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "banner đã được xóa thành công",
        success: true,
        error: "",
      });
    });
  }

  static updateStatus(id, status, callback) {
    db.query(
      "UPDATE banner SET status = ? WHERE id = ?",
      [status, id],
      (err, result) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể cập nhật trạng thái danh mục",
            success: false,
            error: err.message,
          });
        }
        if (result.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy danh mục để cập nhật",
            success: false,
            error: "",
          });
        }
        callback({
          data: id,
          message: "Trạng thái danh mục đã được cập nhật thành công",
          success: true,
          error: "",
        });
      }
    );
  }

  static updateTrash(id, trash, callback) {
    db.query(
      "UPDATE banner SET trash = ? WHERE id = ?",
      [trash, id],
      (err, result) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể cập nhật trạng thái xoá của danh mục",
            success: false,
            error: err.message,
          });
        }
        if (result.affectedRows === 0) {
          return callback({
            data: [],
            message: "Không tìm thấy danh mục để cập nhật",
            success: false,
            error: "",
          });
        }
        callback({
          data: id,
          message: "Trạng thái xoá của danh mục đã được cập nhật thành công",
          success: true,
          error: "",
        });
      }
    );
  }

  static getListByStatus(status, callback) {
    db.query("SELECT * FROM banner WHERE status = ?", [status], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách danh mục theo trạng thái",
          success: false,
          error: err.message,
        });
      }
      callback({
        data: rows,
        message: "Danh sách danh mục theo trạng thái đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }

  static getListByTrash(trash, callback) {
    db.query("SELECT * FROM banner WHERE trash = ?", [trash], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách danh mục theo trạng thái xoá",
          success: false,
          error: err.message,
        });
      }
      callback({
        data: rows,
        message:
          "Danh sách danh mục theo trạng thái xoá đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }
}

module.exports = BannerModel;
