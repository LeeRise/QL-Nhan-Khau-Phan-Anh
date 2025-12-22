const db = require('../config/db');

// GET all
exports.getAll = (req, res) => {
    db.all("SELECT * FROM Ho_Khau", [], (err, rows) => {
        if (err) return res.status(500).json({ 
            success: false,
            message: "Lỗi lấy danh sách hộ khẩu"
         });
        res.json({
            success: true,
            data: rows
        });
    });
};

// GET one
exports.getOne = (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM Ho_Khau WHERE Ma_HK = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ 
            success: false,
            message: "Lỗi lấy thông tin hộ khẩu"
         });
        if (!row) return res.status(404).json({ 
            success: false,
            message: "Không tìm thấy hộ khẩu"
        });
        res.json({
            success: true,
            data: row
        });
    });
};

// CREATE
exports.create = (req, res) => {
    const { Dia_Chi, Ngay_Lap, CCCD_Chu_Ho, Tinh_Trang } = req.body;

    const sql = `
        INSERT INTO Ho_Khau (Dia_Chi, Ngay_Lap, CCCD_Chu_Ho, Tinh_Trang)
        VALUES (?, ?, ?, ?)
    `;
    const params = [
        Dia_Chi,
        Ngay_Lap,
        CCCD_Chu_Ho || null,
        Tinh_Trang || "Tồn tại"
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ Ma_HK: this.lastID });
    });
};

// UPDATE
exports.update = (req, res) => {
    const id = req.params.id;
    const fields = Object.keys(req.body);
    if (fields.length === 0) return res.status(400).json({ error: "No data" });

    const setClause = fields.map(f => `${f} = ?`).join(", ");
    const params = fields.map(f => req.body[f]);
    params.push(id);

    const sql = `UPDATE Ho_Khau SET ${setClause} WHERE Ma_HK = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy hộ khẩu" });
        res.json({ updated: this.changes });
    });
};

// DELETE
exports.remove = (req, res) => {
    db.run("DELETE FROM Ho_Khau WHERE Ma_HK = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy hộ khẩu" });
        res.json({ deleted: this.changes });
    });
};
