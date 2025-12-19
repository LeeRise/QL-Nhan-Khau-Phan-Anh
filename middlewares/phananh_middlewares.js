const db = require('../config/db');

// Kiểm tra phản ánh có tồn tại
exports.checkPAExists = (req, res, next) => {
    const id = req.params.id;

    db.get("SELECT * FROM Phan_Anh WHERE Ma_PA = ?", [id], (err, pa) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!pa) return res.status(404).json({ error: "Phản ánh không tồn tại" });
        req.phanAnh = pa; // Lưu vào req để sử dụng sau
        next();
    });
};

// Validate dữ liệu phản ánh
exports.validatePhanAnh = (req, res, next) => {
    const { Tieu_De, Loai_Van_De } = req.body;

    if (!Tieu_De || !Loai_Van_De) {
        return res.status(400).json({ error: "Thiếu Tiêu đề hoặc Loại vấn đề" });
    }

    next();
};

// Validate phản hồi
exports.validatePhanHoi = (req, res, next) => {
    const { Phan_Hoi, Trang_Thai } = req.body;

    if (!Phan_Hoi && !Trang_Thai) {
        return res.status(400).json({ error: "Cần ít nhất Phản hồi hoặc Trạng thái" });
    }

    next();
};
