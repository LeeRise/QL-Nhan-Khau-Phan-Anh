const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./qlnhankhau.db');

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) throw err;
        console.log("Danh sách bảng trong database:");
        console.log(tables);
        db.all("SELECT * FROM Nhan_Khau LIMIT 5", [], (err, rows) => {
            if (err) console.error(err);
            else console.log("Dữ liệu mẫu bảng Nhan_Khau:", rows);
        });
    });
});

db.close();
