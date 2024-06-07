const db = require("../configs/database");
const bannerSchema = require("../schemas/BannerSchema");
const fs = require('fs');
const path = require("path");

class BannerModel {
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

  static getList(callback) {
    this.executeQuery("SELECT * FROM banner", [], "Danh sách banner đã được lấy thành công", "Không thể lấy danh sách banner", callback);
  }

  static getDetail(id, callback) {
    this.executeQuery("SELECT * FROM banner WHERE id = ?", [id], "Thông tin banner đã được lấy thành công", "Không thể lấy thông tin banner", (response) => {
      if (response.data.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy banner",
          success: false,
          error: "",
        });
      }
      response.data = response.data[0];
      callback(response);
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
        callback({
          data: rows,
          message: "Danh sách banner đã được lấy thành công",
          success: true,
          error: "",
          totalCount: countResult[0].totalCount,
        });
      });
    });
  }

  static deleteImage(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  static handleErrorWithImageDeletion(error, newBanner, errorMessage, callback) {
    if (newBanner.image) {
      const imagePath = path.join(__dirname, '..', '..', '..', newBanner.image);
      this.deleteImage(imagePath);
    }
    callback({
      data: [],
      message: errorMessage,
      success: false,
      error: error.details ? error.details[0].message : error.message,
    });
  }

  static create(newBanner, callback) {
    const { error } = bannerSchema.validate(newBanner);
    if (error) {
      return this.handleErrorWithImageDeletion(error, newBanner, "Dữ liệu không hợp lệ", callback);
    }
    db.query("INSERT INTO banner SET ?", newBanner, (err, result) => {
      if (err) {
        return this.handleErrorWithImageDeletion(err, newBanner, "Không thể thêm banner", callback);
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
    db.query("SELECT image FROM banner WHERE id = ?", [id], (err, rows) => {
      if (err || rows.length === 0) {
        return this.handleErrorWithImageDeletion(err || new Error("Không tìm thấy danh mục"), updatedBanner, err ? "Không thể lấy thông tin danh mục" : "Không tìm thấy danh mục", callback);
      }
      if (!updatedBanner.image) {
        updatedBanner.image = rows[0].image;
      }
      db.query("UPDATE banner SET ? WHERE id = ?", [updatedBanner, id], (err, result) => {
        if (err || result.affectedRows === 0) {
          return this.handleErrorWithImageDeletion(err || new Error("Không tìm thấy banner dùng để cập nhật"), updatedBanner, err ? "Không thể cập nhật banner" : "Không tìm thấy banner dùng để cập nhật", callback);
        }
        callback({
          data: id,
          message: "Thông tin banner đã được cập nhật thành công",
          success: true,
          error: "",
        });
      });
    });
  }

  static delete(id, callback) {
    db.query("DELETE FROM banner WHERE id = ?", [id], (err, result) => {
      if (err || result.affectedRows === 0) {
        return callback({
          data: [],
          message: err ? "Không thể xóa banner" : "Không tìm thấy banner để xóa",
          success: false,
          error: err ? err.message : "",
        });
      }
      callback({
        data: id,
        message: "Banner đã được xóa thành công",
        success: true,
        error: "",
      });
    });
  }

  static updateStatus(id, status, callback) {
    this.executeQuery("UPDATE banner SET status = ? WHERE id = ?", [status, id], "Trạng thái banner đã được cập nhật thành công", "Không thể cập nhật trạng thái banner", callback);
  }

  static updateTrash(id, trash, callback) {
    this.executeQuery("UPDATE banner SET trash = ? WHERE id = ?", [trash, id], "Trạng thái xoá của banner đã được cập nhật thành công", "Không thể cập nhật trạng thái xoá của banner", callback);
  }

  static getListByStatus(status, callback) {
    this.executeQuery("SELECT * FROM banner WHERE status = ?", [status], "Danh sách banner theo trạng thái đã được lấy thành công", "Không thể lấy danh sách banner theo trạng thái", callback);
  }

  static getListByTrash(trash, callback) {
    this.executeQuery("SELECT * FROM banner WHERE trash = ?", [trash], "Danh sách banner theo trạng thái xoá đã được lấy thành công", "Không thể lấy danh sách banner theo trạng thái xoá", callback);
  }
}

module.exports = BannerModel;
