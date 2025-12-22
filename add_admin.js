const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./qlnhankhau.db");

// Hash mật khẩu
const hashedPassword = bcrypt.hashSync("123456", 10);

// Xóa admin cũ nếu tồn tại
db.run(`DELETE FROM Nguoi_Dung WHERE Ten_DN = 'admin'`, (err) => {
  if (err) {
    console.log("Không có admin cũ để xóa (bình thường)");
  }
  
  // Thêm tài khoản admin mới
  db.run(
    `INSERT INTO Nguoi_Dung (Ten_DN, Mat_Khau, Ma_VT) VALUES (?, ?, ?)`,
    ["admin", hashedPassword, 1], // Ma_VT = 1 là SuperAdmin
    (err) => {
      if (err) {
        console.error(" Lỗi khi tạo tài khoản admin:", err.message);
      } else {
        console.log(" Đã tạo tài khoản admin thành công!");
        console.log("   Username: admin");
        console.log("   Password: 123456");
        console.log("   Role: SuperAdmin");
      }
      
      db.close();
    }
  );
});
