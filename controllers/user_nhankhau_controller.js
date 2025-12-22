const db = require('../config/db');

// User cập nhật thông tin nhân khẩu của mình
exports.updateMyNhanKhau = (req, res) => {
    const currentCCCD = req.user.cccd;
    const userId = req.user.id;

    const {
        Ma_CCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap,
        DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh,
        TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Noi_Lam_Viec
    } = req.body;

    // Nếu chưa có CCCD trong tài khoản, yêu cầu nhập CCCD
    if (!currentCCCD && !Ma_CCCD) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập số CCCD'
        });
    }

    // Validate CCCD format
    if (Ma_CCCD && !/^[0-9]{9,12}$/.test(Ma_CCCD.trim())) {
        return res.status(400).json({
            success: false,
            message: 'CCCD phải là 9-12 chữ số'
        });
    }

    const finalCCCD = Ma_CCCD ? Ma_CCCD.trim() : currentCCCD;

    // Kiểm tra CCCD đã được sử dụng bởi người khác chưa
    db.get('SELECT Ma_ND FROM Nguoi_Dung WHERE Ma_CCCD = ? AND Ma_ND != ?', [finalCCCD, userId], (err, otherUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra dữ liệu'
            });
        }

        if (otherUser) {
            return res.status(400).json({
                success: false,
                message: 'Số CCCD này đã được sử dụng bởi tài khoản khác'
            });
        }

        // Cập nhật CCCD vào bảng Nguoi_Dung nếu chưa có
        const updateCCCD = (callback) => {
            if (!currentCCCD && Ma_CCCD) {
                db.run('UPDATE Nguoi_Dung SET Ma_CCCD = ? WHERE Ma_ND = ?', [finalCCCD, userId], (err) => {
                    if (err) {
                        console.error('Error updating CCCD:', err);
                        return callback(err);
                    }
                    callback(null);
                });
            } else {
                callback(null);
            }
        };

        updateCCCD((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi cập nhật CCCD vào tài khoản'
                });
            }

            // Kiểm tra xem nhân khẩu đã tồn tại chưa
            db.get('SELECT * FROM Nhan_Khau WHERE Ma_CCCD = ?', [finalCCCD], (err, existing) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra dữ liệu'
            });
        }

        if (existing) {
            // Update
            const sql = `
                UPDATE Nhan_Khau 
                SET Ho_Ten = ?, Ngay_Sinh = ?, Ngay_Cap_CC = ?, Noi_Cap = ?,
                    DC_TT = ?, Gioi_Tinh = ?, Email = ?, Que_Quan = ?, Noi_Sinh = ?,
                    TT_Hon_Nhan = ?, Bi_Danh = ?, Nghe_Nghiep = ?, Noi_Lam_Viec = ?
                WHERE Ma_CCCD = ?
            `;

            const params = [
                Ho_Ten, Ngay_Sinh, Ngay_Cap_CC || null, Noi_Cap || null,
                DC_TT || null, Gioi_Tinh, Email || null, Que_Quan || null, Noi_Sinh || null,
                TT_Hon_Nhan || null, Bi_Danh || null, Nghe_Nghiep || null, Noi_Lam_Viec || null,
                finalCCCD
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Lỗi cập nhật thông tin'
                    });
                }

                res.json({
                    success: true,
                    message: 'Cập nhật thông tin thành công'
                });
            });
        } else {
            // Insert new
            const sql = `
                INSERT INTO Nhan_Khau 
                (Ma_CCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap, DC_TT, Gioi_Tinh, 
                 Email, Que_Quan, Noi_Sinh, TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Noi_Lam_Viec, Trang_Thai)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Đang sống')
            `;

            const params = [
                finalCCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC || null, Noi_Cap || null,
                DC_TT || null, Gioi_Tinh, Email || null, Que_Quan || null, Noi_Sinh || null,
                TT_Hon_Nhan || null, Bi_Danh || null, Nghe_Nghiep || null, Noi_Lam_Viec || null
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Lỗi tạo thông tin: ' + err.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Khai báo thông tin thành công',
                    Ma_NK: this.lastID
                });
            });
        }
            });
        });
    });
};

// Kiểm tra user đã khai báo thông tin chưa
exports.checkMyNhanKhau = (req, res) => {
    const userId = req.user.id;
    
    // Lấy CCCD từ database (đảm bảo lấy giá trị mới nhất)
    db.get('SELECT Ma_CCCD FROM Nguoi_Dung WHERE Ma_ND = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra dữ liệu'
            });
        }
        
        const Ma_CCCD = user ? user.Ma_CCCD : null;
        
        if (!Ma_CCCD) {
            return res.json({
                success: true,
                hasInfo: false,
                needsRegistration: true
            });
        }

        db.get('SELECT * FROM Nhan_Khau WHERE Ma_CCCD = ?', [Ma_CCCD], (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi kiểm tra dữ liệu'
                });
            }

            res.json({
                success: true,
                hasInfo: !!row,
                needsRegistration: !row,
                data: row || null
            });
        });
    });
};
