const db = require("../configs/database");
const categorySchema = require("../schemas/CategorySchema");

class CategoryModel {
  static getList(callback) {
    db.query("SELECT * FROM category", (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách danh mục",
          success: false,
          error: err.message,
        });
      }
      callback({
        data: rows,
        message: "Danh sách danh mục đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }

  static getDetail(id, callback) {
    db.query("SELECT * FROM category WHERE id = ?", [id], (err, rows) => {
      if (err) {
        return callback({
          data: {},
          message: "Không thể lấy thông tin danh mục",
          success: false,
          error: err.message,
        });
      }
      if (rows.length === 0) {
        return callback({
          data: {},
          message: "Không tìm thấy danh mục",
          success: false,
          error: "",
        });
      }
      callback({
        data: rows[0],
        message: "Thông tin danh mục đã được lấy thành công",
        success: true,
        error: "",
      });
    });
  }

  static getListWithLimitOffset(limit, offset, callback) {
    const query = "SELECT * FROM category LIMIT ? OFFSET ?";
    const countQuery = "SELECT COUNT(*) as totalCount FROM users";
    db.query(query, [limit, offset], (err, rows) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể lấy danh sách danh mục",
          success: false,
          error: err.message,
          totalCount: 0,
        });
      }

      db.query(countQuery, (err, countResult) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể đếm số lượng danh mục",
            success: false,
            error: err.message,
            totalCount: 0,
          });
        }

        const totalCount = countResult[0].totalCount;

        callback({
          data: rows,
          message: "Danh sách danh mục đã được lấy thành công",
          success: true,
          error: "",
          totalCount: totalCount,
        });
      });
    });
  }

  static create(newCategory, callback) {
    const { error } = categorySchema.validate(newCategory);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    db.query("INSERT INTO category SET ?", newCategory, (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể thêm danh mục",
          success: false,
          error: err.message,
        });
      }
      callback({
        data: result.insertId,
        message: "Danh mục đã được thêm thành công",
        success: true,
        error: "",
      });
    });
  }

  static update(id, updatedCategory, callback) {
    const { error } = categorySchema.validate(updatedCategory);
    if (error) {
      return callback({
        data: [],
        message: "Dữ liệu không hợp lệ",
        success: false,
        error: error.details[0].message,
      });
    }
    db.query(
      "UPDATE category SET ? WHERE id = ?",
      [updatedCategory, id],
      (err, result) => {
        if (err) {
          return callback({
            data: [],
            message: "Không thể cập nhật thông tin danh mục",
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
          message: "Thông tin danh mục đã được cập nhật thành công",
          success: true,
          error: "",
        });
      }
    );
  }

  static delete(id, callback) {
    db.query("DELETE FROM category WHERE id = ?", [id], (err, result) => {
      if (err) {
        return callback({
          data: [],
          message: "Không thể xóa danh mục",
          success: false,
          error: err.message,
        });
      }
      if (result.affectedRows === 0) {
        return callback({
          data: [],
          message: "Không tìm thấy danh mục để xóa",
          success: false,
          error: "",
        });
      }
      callback({
        data: id,
        message: "Danh mục đã được xóa thành công",
        success: true,
        error: "",
      });
    });
  }
}

module.exports = CategoryModel;
