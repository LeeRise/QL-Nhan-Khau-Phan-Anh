const db = require('../config/db');

exports.getAll = (req, res) => {
  db.all("SELECT * FROM Phan_Anh ORDER BY Ngay_PA DESC", [], (err, rows) => {
    if (err) return res.status(500).json({  
      success: false,
      message: "Lỗi lấy danh sách phản ánh"
    });
    res.json({
      success: true,
      data: rows
    });
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM Phan_Anh WHERE Ma_PA = ?", [id], (err, row) => {
    if (err) return res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin phản ánh"
     });
    if (!row) return res.status(404).json({ 
      success: false,
      message: "Không tìm thấy phản ánh"
    });
    res.json({
      success: true,
      data: row
    });
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


// Lấy phản ánh của người dùng hiện tại
exports.getMyReports = (req, res) => {
  const Ma_CCCD = req.user.cccd;

  if (!Ma_CCCD) {
    return res.json({ 
      success: true,
      needsInfo: true,
      data: [],
      message: 'Vui lòng khai báo thông tin nhân khẩu để sử dụng chức năng này'
    });
  }

  db.all(
    "SELECT * FROM Phan_Anh WHERE Ma_CCCD = ? ORDER BY Ngay_PA DESC",
    [Ma_CCCD],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          message: 'Lỗi lấy danh sách phản ánh' 
        });
      }
      res.json({
        success: true,
        data: rows
      });
    }
  );
};

// Tạo phản ánh mới (user)
exports.createMyReport = (req, res) => {
  const Ma_CCCD = req.user.cccd;
  const { Tieu_De, Loai_Van_De } = req.body;

  if (!Ma_CCCD) {
    return res.status(400).json({ 
      success: false,
      needsInfo: true,
      message: 'Vui lòng khai báo thông tin nhân khẩu trước khi gửi phản ánh'
    });
  }

  const sql = `INSERT INTO Phan_Anh (Tieu_De, Loai_Van_De, Ma_CCCD, Trang_Thai)
               VALUES (?,?,?,?)`;
  const params = [Tieu_De, Loai_Van_De || null, Ma_CCCD, 'Chưa Tiếp nhận'];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi khi tạo phản ánh' 
      });
    }
    res.status(201).json({ 
      success: true,
      message: 'Tạo phản ánh thành công',
      Ma_PA: this.lastID 
    });
  });
};

// Phản hồi phản ánh

exports.reply = (req, res) => {
  const Ma_PA = req.params.id;
  const { Phan_Hoi, Trang_Thai } = req.body;
  const Ma_CCCD_XL = req.user.cccd; // Lấy CCCD của cán bộ từ Token

  if (!Phan_Hoi) {
    return res.status(400).json({ success: false, message: "Nội dung phản hồi không được trống" });
  }

  // Sử dụng serialize để đảm bảo hai hành động được thực hiện tuần tự
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // 1. Chèn nội dung phản hồi vào bảng Phan_Hoi
    const sqlInsertReply = `
      INSERT INTO Phan_Hoi (Ma_PA, Noi_Dung, Ma_CCCD_XL)
      VALUES (?, ?, ?)
    `;
    
    db.run(sqlInsertReply, [Ma_PA, Phan_Hoi, Ma_CCCD_XL], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ success: false, message: "Lỗi lưu phản hồi: " + err.message });
      }

      // 2. Cập nhật trạng thái của phản ánh gốc trong bảng Phan_Anh
      const sqlUpdatePA = `UPDATE Phan_Anh SET Trang_Thai = ? WHERE Ma_PA = ?`;
      
      db.run(sqlUpdatePA, [Trang_Thai || 'Đã xử lý', Ma_PA], function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ success: false, message: "Lỗi cập nhật trạng thái" });
        }

        db.run("COMMIT");
        res.json({ 
          success: true, 
          message: "Phản hồi và cập nhật trạng thái thành công",
          Ma_PH: this.lastID 
        });
      });
    });
  });
};

exports.mergeReports = (req, res) => {
    const { maPAGoc, maPADuocGop } = req.body;
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run("INSERT INTO Gop_PA (Ma_PA_Goc, Ma_PA_Duoc_Gop) VALUES (?, ?)", [maPAGoc, maPADuocGop]);
        db.run("UPDATE Phan_Anh SET Trang_Thai = 'Đã gộp' WHERE Ma_PA = ?", [maPADuocGop]);
        db.run("COMMIT", (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: "Đã gộp phản ánh trùng lặp" });
        });
    });
};

// Khi cán bộ tiếp nhận/xử lý và gửi thông báo cho dân
exports.processAndNotify = (req, res) => {
    const { Ma_PA, Noi_Dung_Phan_Hoi, Trang_Thai_Moi } = req.body;
    const Ma_CCCD_XL = req.user.cccd; // CCCD của cán bộ đang đăng nhập

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Cập nhật trạng thái (Tiếp nhận -> Đã xử lý)
        db.run("UPDATE Phan_Anh SET Trang_Thai = ? WHERE Ma_PA = ?", [Trang_Thai_Moi, Ma_PA]);

        // 2. Lưu nội dung phản hồi (Đây chính là thông báo cho dân)
        db.run(
            "INSERT INTO Phan_Hoi (Ma_PA, Noi_Dung, Ma_CCCD_XL) VALUES (?, ?, ?)",
            [Ma_PA, Noi_Dung_Phan_Hoi, Ma_CCCD_XL]
        );

        db.run("COMMIT", (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: "Đã xử lý và gửi thông báo cho dân thành công" });
        });
    });
};



// Lấy tất cả (Admin)
exports.getAll = (req, res) => {
  db.all("SELECT * FROM Phan_Anh ORDER BY Ngay_PA DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi lấy danh sách" });
    res.json({ success: true, data: rows });
  });
};

// Lấy phản ánh của người dân (Có kèm lời nhắn của cán bộ)
exports.getMyReports = (req, res) => {
  const Ma_CCCD = req.user.cccd;
  if (!Ma_CCCD) return res.json({ success: true, needsInfo: true, data: [] });

  // Nối với bảng Phan_Hoi để lấy nội dung trả lời
  const sql = `
    SELECT pa.*, ph.Noi_Dung as Phan_Hoi 
    FROM Phan_Anh pa
    LEFT JOIN Phan_Hoi ph ON pa.Ma_PA = ph.Ma_PA
    WHERE pa.Ma_CCCD = ? 
    ORDER BY pa.Ngay_PA DESC
  `;
  db.all(sql, [Ma_CCCD], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu' });
    res.json({ success: true, data: rows });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // 1. Xóa tất cả phản hồi liên quan trong bảng Phan_Hoi trước
    db.run("DELETE FROM Phan_Hoi WHERE Ma_PA = ?", [id], (err) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ success: false, error: err.message });
      }

      // 2. Sau đó mới xóa phản ánh trong bảng Phan_Anh
      db.run("DELETE FROM Phan_Anh WHERE Ma_PA = ?", [id], function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ success: false, error: err.message });
        }

        db.run("COMMIT");
        res.json({ success: true, message: "Xóa thành công phản ánh và các phản hồi liên quan" });
      });
    });
  });
};
