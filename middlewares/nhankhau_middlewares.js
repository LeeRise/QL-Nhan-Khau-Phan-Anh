const db = require('../config/db');

// Kiểm tra hộ khẩu có tồn tại
exports.checkHKExists = (req, res, next) => {
    const Ma_HK = req.body.Ma_HK || req.body.newMaHK;

    if (!Ma_HK) return next(); // không có thì bỏ qua

    db.get("SELECT * FROM Ho_Khau WHERE Ma_HK = ?", [Ma_HK], (err, hk) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!hk) return res.status(404).json({ error: "Hộ khẩu không tồn tại" });
        next();
    });
};

// Kiểm tra nhân khẩu có tồn tại
exports.checkNKExists = (req, res, next) => {
    const id = req.params.id || req.body.Ma_NK;

    db.get("SELECT * FROM Nhan_Khau WHERE Ma_NK = ?", [id], (err, nk) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!nk) return res.status(404).json({ error: "Nhân khẩu không tồn tại" });
        next();
    });
};

//  cho thêm trẻ sơ sinh
exports.validateNewBorn = (req, res, next) => {
    const { Ho_Ten, Ngay_Sinh, Gioi_Tinh, Ma_HK } = req.body;

    if (!Ho_Ten || !Ngay_Sinh || !Gioi_Tinh || !Ma_HK)
        return res.status(400).json({ error: "Thiếu thông tin trẻ sơ sinh" });

    next();
};

// kiểm tra trạng thái hợp lệ
exports.validateTrangThai = (req, res, next) => {
    const { Trang_Thai } = req.body;

    const allowed = ["Đang sống", "Qua đời", "Mất tích", "Chuyển đi"];

    if (Trang_Thai && !allowed.includes(Trang_Thai))
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });

    next();
};
