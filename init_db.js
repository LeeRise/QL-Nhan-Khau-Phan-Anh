const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dbFile = "./qlnhankhau.db";
const sqlFile = "./QLNK.sql";

// xoá db cũ nếu tồn tại
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log("Đã xoá database cũ");
}

const db = new sqlite3.Database(dbFile);

const sql = fs.readFileSync(sqlFile, "utf8");

db.close();
