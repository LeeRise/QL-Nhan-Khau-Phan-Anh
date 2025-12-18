const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require("../config/db");

exports.login = (req, res, next) => {
    const { username, password } = req.body;

if (!username || !password) {
        return res.status(400).json({ message: 'Thiếu tên đăng nhập hoặc mật khẩu' });
    }

const sql = `
    SELECT 
      nd.Ma_ND,
      nd.Ten_DN,
      nd.Mat_Khau,
      vt.Ten_VT
    FROM Nguoi_Dung nd
    JOIN Vai_Tro vt ON nd.Ma_VT = vt.Ma_VT
    WHERE nd.Ten_DN = ?
  `;
    db.get(sql, [username], (err, user) => {
        
        if (err) {
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
        const isMatch = user && bcrypt.compareSync(password, user.Mat_Khau);

        if (!isMatch) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        const token = jwt.sign(
            { id:user.Ma_ND, role: user.Ten_VT },
            process.env.JWT_SECRET || "qlnk_secret_key",
            { expiresIn: '1d' }
        );
        
        res.json({
            sucess: true,
            token,
            role: user.Ten_VT
        });
    });
};
