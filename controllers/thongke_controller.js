const db = require('../config/db');

exports.getGeneralStats = (req, res) => {
    const stats = {};
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM Nhan_Khau WHERE Trang_Thai = 'Đang sống') as tongNK,
            (SELECT COUNT(*) FROM Ho_Khau WHERE Tinh_Trang = 'Tồn tại') as tongHK,
            (SELECT COUNT(*) FROM Phan_Anh WHERE Trang_Thai = 'Chưa Tiếp nhận') as paMoi
    `;
    db.get(sql, [], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Thống kê dân số theo giới tính
        db.all("SELECT Gioi_Tinh, COUNT(*) as count FROM Nhan_Khau GROUP BY Gioi_Tinh", [], (err, rows) => {
            stats.overview = row;
            stats.genderDist = rows;
            res.json({ success: true, data: stats });
        });
    });
};


exports.getDetailedStats = (req, res) => {
    // 1. Thống kê số lượng theo từng loại (An ninh, Môi trường, Xã hội)
    const sqlByType = `
        SELECT Loai_Van_De, COUNT(*) as tongSo 
        FROM Phan_Anh 
        GROUP BY Loai_Van_De`;

    // 2. Thống kê chi tiết: Ai phản ánh, loại nào, trạng thái nào
    const sqlDetail = `
        SELECT pa.Ma_PA, pa.Tieu_De, pa.Loai_Van_De, pa.Trang_Thai, pa.Ngay_PA, nk.Ho_Ten as Nguoi_Phan_Anh
        FROM Phan_Anh pa
        LEFT JOIN Nhan_Khau nk ON pa.Ma_CCCD = nk.Ma_CCCD
        ORDER BY pa.Ngay_PA DESC`;

    db.all(sqlByType, [], (err, typeStats) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        db.all(sqlDetail, [], (err, details) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            res.json({
                success: true,
                data: {
                    byType: typeStats, // Tổng số theo loại
                    details: details   // Danh sách chi tiết
                }
            });
        });
    });
};