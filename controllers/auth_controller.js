const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require("../config/db");

exports.login = (req, res, next) => {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, password: '***' });

    if (!username || !password) {
        console.log('❌ Missing username or password');
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
            console.log('❌ Database error:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }
        
        if (!user) {
            console.log('❌ User not found:', username);
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        console.log('✅ User found:', user.Ten_DN);
        console.log('Hash in DB:', user.Mat_Khau);
        console.log('Password from request:', password);
        
        const isMatch = bcrypt.compareSync(password, user.Mat_Khau);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
        
        console.log('✅ Login successful');
        const token = jwt.sign(
            { id:user.Ma_ND, role: user.Ten_VT },
            process.env.JWT_SECRET || "qlnk_secret_key",
            { expiresIn: '1d' }
        );
        
        res.json({
            success: true,
            token,
            role: user.Ten_VT
        });
    });
};

exports.register = (req, res) => {
    const { username, password } = req.body;

    console.log('📝 Register attempt:', { username });

    if (!username || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Vui lòng cung cấp đầy đủ thông tin (tên đăng nhập, mật khẩu)' 
        });
    }

    // Kiểm tra username đã tồn tại chưa
    db.get('SELECT * FROM Nguoi_Dung WHERE Ten_DN = ?', [username], (err, existingUser) => {
        if (err) {
            console.log('❌ Database error:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi máy chủ' 
            });
        }

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Tên đăng nhập đã tồn tại' 
            });
        }

        // Lấy Ma_VT của role "Người Dân"
        db.get('SELECT Ma_VT FROM Vai_Tro WHERE Ten_VT = ?', ['Người Dân'], (err, role) => {
            if (err || !role) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi hệ thống role'
                });
            }

            // Hash password
            const hashedPassword = bcrypt.hashSync(password, 10);

            const sql = `
                INSERT INTO Nguoi_Dung (Ten_DN, Mat_Khau, Ma_VT)
                VALUES (?, ?, ?)
            `;

            db.run(sql, [username, hashedPassword, role.Ma_VT], function(err) {
                if (err) {
                    console.log('❌ Insert error:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Lỗi khi tạo tài khoản: ' + err.message 
                    });
                }

                console.log('✅ User created:', this.lastID);

                // Tạo token ngay sau khi đăng ký
                const token = jwt.sign(
                    { id: this.lastID, role: 'Người Dân' },
                    process.env.JWT_SECRET || "qlnk_secret_key",
                    { expiresIn: '1d' }
                );

                res.status(201).json({
                    success: true,
                    message: 'Đăng ký thành công. Vui lòng khai báo thông tin chi tiết.',
                    token,
                    role: 'Người Dân'
                });
            });
        })
    });
};
