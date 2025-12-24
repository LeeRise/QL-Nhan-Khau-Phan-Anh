// controllers/thongke_controller.js
const db = require('../config/db');

exports.getGeneralStats = (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM Nhan_Khau) as totalNhanKhau,
            (SELECT COUNT(*) FROM Ho_Khau) as totalHoKhau,
            (SELECT COUNT(*) FROM Phan_Anh) as totalPhanAnh,
            (SELECT COUNT(*) FROM Bien_Dong_HK) as totalBienDong,
            (SELECT COUNT(*) FROM Phan_Anh WHERE Trang_Thai = 'Chưa Tiếp nhận') as pendingPhanAnh,
            (SELECT COUNT(*) FROM Ho_Khau WHERE Tinh_Trang = 'Tồn tại') as hoKhauTonTai,
            (SELECT COUNT(*) FROM Nhan_Khau WHERE Gioi_Tinh = 'Nam') as nhanKhauNam,
            (SELECT COUNT(*) FROM Nhan_Khau WHERE Gioi_Tinh = 'Nữ') as nhanKhauNu,
            (SELECT COUNT(*) FROM Nhan_Khau WHERE Trang_Thai = 'Đang sống') as nhanKhauDangSong,
            -- Thống kê 3 loại theo yêu cầu của bạn
            (SELECT COUNT(*) FROM Phan_Anh WHERE Loai_Van_De = 'An ninh') as paAnNinh,
            (SELECT COUNT(*) FROM Phan_Anh WHERE Loai_Van_De = 'Môi trường') as paMoiTruong,
            (SELECT COUNT(*) FROM Phan_Anh WHERE Loai_Van_De = 'Xã hội') as paXaHoi
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: row });
    });
};

exports.getDetailedStats = (req, res) => {
    const sql = `
        SELECT 
            SUM(CASE WHEN Loai_Van_De = 'An ninh' THEN 1 ELSE 0 END) as anNinh,
            SUM(CASE WHEN Loai_Van_De = 'Môi trường' THEN 1 ELSE 0 END) as moiTruong,
            SUM(CASE WHEN Loai_Van_De = 'Xã hội' THEN 1 ELSE 0 END) as xaHoi
        FROM Phan_Anh
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: { counts: row } });
    });
};