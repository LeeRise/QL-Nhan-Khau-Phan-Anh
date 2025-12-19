const db = require('../config/db');

// Kiểm tra hộ khẩu có tồn tại
exports.checkHKExists = (req, res, next) => {
    const id = req.params.id;

    db.get("SELECT * FROM Ho_Khau WHERE Ma_HK = ?", [id], (err, hk) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!hk) return res.status(404).json({ error: "Hộ khẩu không tồn tại" });
        req.hoKhau = hk; // Lưu vào req để sử dụng sau
        next();
    });
};

// Validate dữ liệu hộ khẩu
exports.validateHoKhau = (req, res, next) => {
    const { Dia_Chi, Ngay_Lap } = req.body;

    // Chỉ kiểm tra khi tạo mới (POST)
    if (req.method === 'POST') {
        if (!Dia_Chi || !Ngay_Lap) {
            return res.status(400).json({ error: "Thiếu địa chỉ hoặc ngày lập" });
        }
    }

    next();
};
