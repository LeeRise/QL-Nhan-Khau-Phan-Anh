const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./qlnhankhau.db', (err) => {
    if (err) console.error("DB Connect Error:", err);
});

db.run("PRAGMA foreign_keys = ON");

module.exports = db;
