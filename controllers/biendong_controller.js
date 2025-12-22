const db = require('../config/db');

// Lấy danh sách biến động của user (theo CCCD)
exports.getMyBienDong = (req, res) => {
    const Ma_CCCD = req.user.cccd;

    if (!Ma_CCCD) {
        return res.json({
            success: true,
            needsInfo: true,
            data: [],
            message: 'Vui lòng khai báo thông tin nhân khẩu để sử dụng chức năng này'
        });
    }

    const sql = `
        SELECT bd.*, nk.Ho_Ten, nk.Ma_CCCD
        FROM Bien_Dong_HK bd
        JOIN Nhan_Khau nk ON bd.Ma_NK = nk.Ma_NK
        WHERE nk.Ma_CCCD = ?
        ORDER BY bd.Ngay_Thuc_Hien DESC
    `;

    db.all(sql, [Ma_CCCD], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách biến động'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
};

// Lấy thông tin nhân khẩu của user
exports.getMyInfo = (req, res) => {
    const Ma_CCCD = req.user.cccd;

    if (!Ma_CCCD) {
        return res.json({
            success: true,
            needsInfo: true,
            data: null,
            message: 'Vui lòng khai báo thông tin nhân khẩu'
        });
    }

    db.get('SELECT * FROM Nhan_Khau WHERE Ma_CCCD = ?', [Ma_CCCD], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi lấy thông tin'
            });
        }
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin nhân khẩu'
            });
        }
        res.json({
            success: true,
            data: row
        });
    });
};

// Đăng ký tạm trú/tạm vắng
exports.createBienDong = (req, res) => {
    const Ma_CCCD = req.user.cccd;
    const { Loai_Bien_Dong, DC_Moi, Ngay_Bat_Dau, Ngay_Ket_Thuc, Ghi_Chu } = req.body;

    if (!Ma_CCCD) {
        return res.status(400).json({
            success: false,
            needsInfo: true,
            message: 'Vui lòng khai báo thông tin nhân khẩu trước khi đăng ký biến động'
        });
    }

    // Lấy Ma_NK từ CCCD
    db.get('SELECT Ma_NK, DC_TT FROM Nhan_Khau WHERE Ma_CCCD = ?', [Ma_CCCD], (err, nhankhau) => {
        if (err || !nhankhau) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin nhân khẩu'
            });
        }

        const sql = `
            INSERT INTO Bien_Dong_HK 
            (Loai_Bien_Dong, Ma_NK, Ngay_Thuc_Hien, Ngay_Ket_Thuc, DC_Cu, DC_Moi, Ghi_Chu)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            Loai_Bien_Dong,
            nhankhau.Ma_NK,
            Ngay_Bat_Dau || new Date().toISOString().split('T')[0],
            Ngay_Ket_Thuc || null,
            nhankhau.DC_TT,
            DC_Moi || null,
            Ghi_Chu || null
        ];

        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi tạo biến động'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Đăng ký biến động thành công',
                Ma_BD: this.lastID
            });
        });
    });
};

// Cập nhật trạng thái nhân khẩu (mất, chuyển đi)
exports.updateMyStatus = (req, res) => {
    const Ma_CCCD = req.user.cccd;
    const { Trang_Thai, Ghi_Chu } = req.body;

    if (!Ma_CCCD) {
        return res.status(400).json({
            success: false,
            needsInfo: true,
            message: 'Vui lòng khai báo thông tin nhân khẩu trước khi cập nhật trạng thái'
        });
    }

    const allowedStatus = ['Đã mất', 'Chuyển đi'];
    if (!allowedStatus.includes(Trang_Thai)) {
        return res.status(400).json({
            success: false,
            message: 'Trạng thái không hợp lệ'
        });
    }

    // Lấy Ma_NK
    db.get('SELECT Ma_NK FROM Nhan_Khau WHERE Ma_CCCD = ?', [Ma_CCCD], (err, nhankhau) => {
        if (err || !nhankhau) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin nhân khẩu'
            });
        }

        // Cập nhật trạng thái
        db.run('UPDATE Nhan_Khau SET Trang_Thai = ? WHERE Ma_CCCD = ?', [Trang_Thai, Ma_CCCD], function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi cập nhật trạng thái'
                });
            }

            // Ghi biến động
            db.run(`
                INSERT INTO Bien_Dong_HK 
                (Loai_Bien_Dong, Ma_NK, Ngay_Thuc_Hien, Ghi_Chu)
                VALUES (?, ?, DATE('now'), ?)
            `, [Trang_Thai, nhankhau.Ma_NK, Ghi_Chu || null]);

            res.json({
                success: true,
                message: 'Cập nhật trạng thái thành công'
            });
        });
    });
};

// Lấy tất cả biến động (admin)
exports.getAllBienDong = (req, res) => {
    const sql = `
        SELECT bd.*, nk.Ho_Ten, nk.Ma_CCCD
        FROM Bien_Dong_HK bd
        LEFT JOIN Nhan_Khau nk ON bd.Ma_NK = nk.Ma_NK
        ORDER BY bd.Ngay_Thuc_Hien DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách biến động'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
};
