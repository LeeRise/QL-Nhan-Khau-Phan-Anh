const db = require('../config/db');

// GET all
exports.getAll = (req, res) => {
    const q = req.query.q;
    let sql = "SELECT * FROM Nhan_Khau";
    let params = [];

    if (q) {
        sql += " WHERE Ho_Ten LIKE ?";
        params.push(`%${q}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// GET one
exports.getOne = (req, res) => {
    db.get("SELECT * FROM Nhan_Khau WHERE Ma_NK = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Không tìm thấy nhân khẩu" });
        res.json(row);
    });
};

// CREATE
exports.create = (req, res) => {
    const fields = [
        "Ma_CCCD", "Ma_HK", "Ho_Ten", "Ngay_Sinh", "Ngay_Cap_CC", "Noi_Cap",
        "DC_TT", "Gioi_Tinh", "Email", "Que_Quan", "Noi_Sinh",
        "TT_Hon_Nhan", "Bi_Danh", "Nghe_Nghiep", "Noi_Lam_Viec", "Trang_Thai"
    ];

    const sql = `INSERT INTO Nhan_Khau (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`;
    const params = fields.map(f => req.body[f] ?? null);

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ Ma_NK: this.lastID });
    });
};

// UPDATE
exports.update = (req, res) => {
    const allowedFields = [
        "Ma_CCCD", "Ma_HK", "Ho_Ten", "Ngay_Sinh", "Ngay_Cap_CC", 
        "Noi_Cap", "DC_TT", "Gioi_Tinh", "Email", "Que_Quan", 
        "Noi_Sinh", "TT_Hon_Nhan", "Bi_Danh", "Nghe_Nghiep", 
        "Noi_Lam_Viec", "Trang_Thai"
    ];
    
    const fields = Object.keys(req.body).filter(f => allowedFields.includes(f));
    if (fields.length === 0) return res.status(400).json({ error: "No valid data" });

    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const params = fields.map(f => req.body[f]);
    params.push(req.params.id);

    const sql = `UPDATE Nhan_Khau SET ${setClause} WHERE Ma_NK = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy nhân khẩu" });
        res.json({ updated: this.changes });
    });
};

// DELETE
exports.remove = (req, res) => {
    db.run("DELETE FROM Nhan_Khau WHERE Ma_NK = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy nhân khẩu" });
        res.json({ deleted: this.changes });
    });
};


// ==== A1. THÊM TRẺ SƠ SINH ====
exports.addNewBorn = (req, res) => {
    const {
        Ho_Ten, Ngay_Sinh, Gioi_Tinh, Ma_HK,
        Noi_Sinh, Que_Quan
    } = req.body;

    const sql = `
        INSERT INTO Nhan_Khau
        (Ma_CCCD, Ma_HK, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap,
        DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh,
        TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Noi_Lam_Viec, Trang_Thai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        null,           // Ma_CCCD
        Ma_HK,
        Ho_Ten,
        Ngay_Sinh,
        null,           // Ngay_Cap_CC
        null,           // Noi_Cap
        null,           // DC_TT
        Gioi_Tinh,
        null,           // Email
        Que_Quan || null,
        Noi_Sinh || null,
        "Chưa kết hôn",
        null,
        null,
        null,
        "Đang sống"     // Trạng thái mặc định
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const newID = this.lastID;

        // Ghi biến động
        db.run(`
            INSERT INTO Bien_Dong_HK
            (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, Ghi_Chu)
            VALUES ('Sinh', ?, ?, DATE('now'), ?)
        `, [newID, Ma_HK, "Thêm trẻ sơ sinh"], () => {});

        res.status(201).json({ Ma_NK: newID });
    });
};

// ==== A2. CHUYỂN HỘ KHẨU ====
exports.changeHousehold = (req, res) => {
    const Ma_NK = req.params.id;
    const { newMaHK, lyDo } = req.body;

    if (!newMaHK)
        return res.status(400).json({ error: "newMaHK bắt buộc" });

    // Lấy hộ khẩu cũ
    db.get("SELECT Ma_HK FROM Nhan_Khau WHERE Ma_NK = ?", [Ma_NK], (err, nk) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!nk) return res.status(404).json({ error: "Không tìm thấy nhân khẩu" });

        const oldHK = nk.Ma_HK;

        db.run("UPDATE Nhan_Khau SET Ma_HK = ? WHERE Ma_NK = ?", [newMaHK, Ma_NK], function (err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            // GHI BIẾN ĐỘNG
            db.run(`
                INSERT INTO Bien_Dong_HK
                (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, DC_Cu, DC_Moi, Ghi_Chu)
                VALUES ('Chuyển hộ khẩu', ?, ?, DATE('now'), ?, ?, ?)
            `, [Ma_NK, newMaHK, oldHK, newMaHK, lyDo || null], () => {});

            res.json({ message: "Chuyển hộ khẩu thành công" });
        });
    });
};

// ==== A3. ĐỔI TRẠNG THÁI ====
exports.changeStatus = (req, res) => {
    const Ma_NK = req.params.id;
    const { Trang_Thai, lyDo } = req.body;

    if (!Trang_Thai)
        return res.status(400).json({ error: "Thiếu Trang_Thai" });

    db.run(`
        UPDATE Nhan_Khau SET Trang_Thai = ? WHERE Ma_NK = ?
    `, [Trang_Thai, Ma_NK], function (err) {

        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0)
            return res.status(404).json({ error: "Không tìm thấy nhân khẩu" });

        // GHI BIẾN ĐỘNG
        db.run(`
            INSERT INTO Bien_Dong_HK
            (Loai_Bien_Dong, Ma_NK, Ngay_Thuc_Hien, Ghi_Chu)
            VALUES (?, ?, DATE('now'), ?)
        `, [Trang_Thai, Ma_NK, lyDo || null]);

        res.json({ message: "Cập nhật trạng thái thành công" });
    });
};


// ==== A4. GHI BIẾN ĐỘNG THỦ CÔNG ====
exports.addBienDong = (req, res) => {
    const { Loai_Bien_Dong, Ma_NK, Ma_HK, DC_Cu, DC_Moi, Ghi_Chu } = req.body;

    if (!Loai_Bien_Dong || !Ma_NK)
        return res.status(400).json({ error: "Thiếu Loai_Bien_Dong hoặc Ma_NK" });

    db.run(`
        INSERT INTO Bien_Dong_HK
        (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, DC_Cu, DC_Moi, Ghi_Chu)
        VALUES (?, ?, ?, DATE('now'), ?, ?, ?)
    `, [Loai_Bien_Dong, Ma_NK, Ma_HK || null, DC_Cu || null, DC_Moi || null, Ghi_Chu || null], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ Ma_Bien_Dong: this.lastID });
    });
};