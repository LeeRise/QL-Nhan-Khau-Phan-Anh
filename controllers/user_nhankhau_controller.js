const db = require('../config/db');

// User cập nhật thông tin nhân khẩu của mình
// controllers/user_nhankhau_controller.js

exports.updateMyNhanKhau = (req, res) => {
    const userId = req.user.id;
    const currentCCCDInToken = req.user.cccd;

    const {
        Ma_CCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap,
        DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh,
        TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Noi_Lam_Viec
    } = req.body;

    if (!currentCCCDInToken && !Ma_CCCD) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập số CCCD' });
    }

    const finalCCCD = Ma_CCCD ? Ma_CCCD.trim() : currentCCCDInToken;

    // 1. Kiểm tra CCCD có bị trùng với tài khoản khác không
    db.get('SELECT Ma_ND FROM Nguoi_Dung WHERE Ma_CCCD = ? AND Ma_ND != ?', [finalCCCD, userId], (err, otherUser) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi kiểm tra dữ liệu' });
        if (otherUser) return res.status(400).json({ success: false, message: 'Số CCCD này đã được sử dụng bởi tài khoản khác' });

        // 2. Xử lý bảng Nhan_Khau TRƯỚC
        db.get('SELECT * FROM Nhan_Khau WHERE Ma_CCCD = ?', [finalCCCD], (err, existingNK) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi truy vấn nhân khẩu' });

            const runNhanKhauQuery = (query, params, callback) => {
                db.run(query, params, function(err) { callback(err); });
            };

            let nkQuery = "";
            let nkParams = [];

            if (existingNK) {
                nkQuery = `UPDATE Nhan_Khau SET Ho_Ten=?, Ngay_Sinh=?, Ngay_Cap_CC=?, Noi_Cap=?, DC_TT=?, Gioi_Tinh=?, Email=?, Que_Quan=?, Noi_Sinh=?, TT_Hon_Nhan=?, Bi_Danh=?, Nghe_Nghiep=?, Noi_Lam_Viec=? WHERE Ma_CCCD=?`;
                nkParams = [Ho_Ten, Ngay_Sinh, Ngay_Cap_CC||null, Noi_Cap||null, DC_TT||null, Gioi_Tinh, Email||null, Que_Quan||null, Noi_Sinh||null, TT_Hon_Nhan||null, Bi_Danh||null, Nghe_Nghiep||null, Noi_Lam_Viec||null, finalCCCD];
            } else {
                nkQuery = `INSERT INTO Nhan_Khau (Ma_CCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap, DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh, TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Noi_Lam_Viec, Trang_Thai) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Đang sống')`;
                nkParams = [finalCCCD, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC||null, Noi_Cap||null, DC_TT||null, Gioi_Tinh, Email||null, Que_Quan||null, Noi_Sinh||null, TT_Hon_Nhan||null, Bi_Danh||null, Nghe_Nghiep||null, Noi_Lam_Viec||null];
            }

            runNhanKhauQuery(nkQuery, nkParams, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật bảng Nhân Khẩu: ' + err.message });

                // 3. Sau khi Nhan_Khau đã có dữ liệu, mới cập nhật Nguoi_Dung (Khóa ngoại sẽ hợp lệ)
                db.run('UPDATE Nguoi_Dung SET Ma_CCCD = ? WHERE Ma_ND = ?', [finalCCCD, userId], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi liên kết CCCD vào tài khoản' });
                    
                    res.json({ success: true, message: 'Khai báo thông tin thành công' });
                });
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
