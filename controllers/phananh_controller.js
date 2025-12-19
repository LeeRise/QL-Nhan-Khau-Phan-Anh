const db = require('../config/db');

exports.getAll = (req, res) => {
  db.all("SELECT * FROM Phan_Anh ORDER BY Ngay_PA DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM Phan_Anh WHERE Ma_PA = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Không tìm thấy phản ánh" });
    res.json(row);
  });
};

exports.create = (req, res) => {
  const { Tieu_De, Loai_Van_De, Ma_CCCD, Trang_Thai } = req.body;
  const sql = `INSERT INTO Phan_Anh (Tieu_De, Loai_Van_De, Ma_CCCD, Trang_Thai)
               VALUES (?,?,?,?)`;
  const params = [Tieu_De, Loai_Van_De || null, Ma_CCCD || null, Trang_Thai || 'Chưa Tiếp nhận'];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ Ma_PA: this.lastID });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const fields = Object.keys(req.body);
  if (fields.length === 0) return res.status(400).json({ error: "No data" });

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const params = fields.map(f => req.body[f]);
  params.push(id);

  const sql = `UPDATE Phan_Anh SET ${setClause} WHERE Ma_PA = ?`;
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy phản ánh" });
    res.json({ updated: this.changes });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM Phan_Anh WHERE Ma_PA = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy phản ánh" });
    res.json({ deleted: this.changes });
  });
};

// Lấy phản ánh của người dùng hiện tại
exports.getMyReports = (req, res) => {
  const Ma_CCCD = req.user.cccd; // Giả sử user có CCCD trong token

  db.all(
    "SELECT * FROM Phan_Anh WHERE Ma_CCCD = ? ORDER BY Ngay_PA DESC",
    [Ma_CCCD],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

// Phản hồi phản ánh
exports.reply = (req, res) => {
  const id = req.params.id;
  const { Phan_Hoi, Trang_Thai } = req.body;

  const fields = [];
  const params = [];

  if (Phan_Hoi) {
    fields.push("Phan_Hoi = ?");
    params.push(Phan_Hoi);
  }

  if (Trang_Thai) {
    fields.push("Trang_Thai = ?");
    params.push(Trang_Thai);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Không có dữ liệu để cập nhật" });
  }

  params.push(id);
  const sql = `UPDATE Phan_Anh SET ${fields.join(", ")} WHERE Ma_PA = ?`;

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Không tìm thấy phản ánh" });
    res.json({ message: "Phản hồi thành công", updated: this.changes });
  });
};