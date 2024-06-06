const db = require('../configs/database');

class UserModel {
    static getAll(callback) {
        db.query('SELECT * FROM users', (err, rows) => {
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
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
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
        
        // Kiểm tra nếu avatar là một chuỗi base64
        // if (!avatar || !avatar.startsWith('data:image')) {
        //     return callback({
        //         data: [],
        //         message: "Ảnh không hợp lệ",
        //         success: false,
        //         error: "Avatar must be a base64 encoded image.",
        //     });
        // }

        // Kiểm tra email trùng
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
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
            db.query('INSERT INTO users SET ?', { email, password, name, phone, address, avatar }, (err, result) => {
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
            });
        });
    }

    static update(id, updatedUser, callback) {
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
    }

    static delete(id, callback) {
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
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
        db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
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
}

module.exports = UserModel;
