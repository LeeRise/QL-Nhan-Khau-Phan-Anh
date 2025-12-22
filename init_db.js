const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbFile = "./qlnhankhau.db";
const sqlFile = "./QLNK.sql";

// xoá db cũ nếu tồn tại
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log("Đã xoá database cũ");
}

const db = new sqlite3.Database(dbFile);

const sql = fs.readFileSync(sqlFile, "utf8");

db.exec(sql, (err) => {
  if (err) {
    console.error("Lỗi khi tạo database:", err);
    return;
  }
  
  console.log("✅ Đã tạo các bảng thành công");
  
  // Tạo tài khoản admin mặc định
  const hashedPassword = bcrypt.hashSync("123456", 10);
  
  db.run(
    `INSERT INTO Nguoi_Dung (Ten_DN, Mat_Khau, Ma_VT) VALUES (?, ?, ?)`,
    ["admin", hashedPassword, 1], // Ma_VT = 1 là SuperAdmin
    (err) => {
      if (err) {
        console.error("Lỗi khi tạo tài khoản admin:", err);
      } else {
        console.log("✅ Đã tạo tài khoản admin (username: admin, password: 123456)");
      }
      
      db.close(() => {
        console.log("✅ Hoàn tất khởi tạo database");
      });
    }
  );
});
