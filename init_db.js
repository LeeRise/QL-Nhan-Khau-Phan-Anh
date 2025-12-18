const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbFile = "./qlnhankhau.db";
const sqlFile = "./QLNK.sql";

// xoá db cũ nếu tồn tại
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log("🗑️ Đã xoá database cũ");
}

const db = new sqlite3.Database(dbFile);

const sql = fs.readFileSync(sqlFile, "utf8");

db.serialize(() => {
  console.log("⏳ Đang khởi tạo database từ file SQL...");

  db.exec(sql, (err) => {
    if (err) {
      console.error("❌ Lỗi khi chạy SQL:", err.message);
      return;
    }

    console.log("✅ Database đã được tạo thành công");

    // Tạo user admin với password đã hash
    const hashedPassword = bcrypt.hashSync("123456", 10);
    const insertAdmin = `INSERT INTO Nguoi_Dung (Ten_DN, Mat_Khau, Ma_VT) VALUES (?, ?, 1)`;
    
    db.run(insertAdmin, ["admin", hashedPassword], (err) => {
      if (err) {
        console.error("❌ Lỗi khi tạo user admin:", err.message);
      } else {
        console.log("✅ Đã tạo user admin với password: 123456");
      }
      db.close();
    });
  });
});
