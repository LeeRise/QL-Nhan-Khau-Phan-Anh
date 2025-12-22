const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    jwt.verify(token, process.env.JWT_SECRET || "qlnk_secret_key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ' });
        }
        
        // Lấy CCCD từ database
        db.get('SELECT Ma_CCCD FROM Nguoi_Dung WHERE Ma_ND = ?', [decoded.id], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            
            req.user = {
                id: decoded.id,
                role: decoded.role,
                cccd: user ? user.Ma_CCCD : null
            };
            next();
        });
    });
};

exports.checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        next();
    };
};

// Middleware cho phép SuperAdmin hoặc chính user đó
exports.checkOwnerOrAdmin = (req, res, next) => {
    const userRole = req.user?.role;
    const userCCCD = req.user?.cccd;
    
    // SuperAdmin thấy tất cả
    if (userRole === 'SuperAdmin') {
        return next();
    }
    
    // Đối với UPDATE/DELETE, kiểm tra CCCD trong database
    const Ma_NK = req.params.id;
    const db = require('../config/db');
    
    db.get('SELECT Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = ?', [Ma_NK], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy nhân khẩu' 
            });
        }
        
        // User chỉ sửa/xóa thông tin của chính mình
        if (row.Ma_CCCD === userCCCD) {
            return next();
        }
        
        return res.status(403).json({ 
            success: false,
            message: 'Bạn không có quyền thao tác trên thông tin này' 
        });
    });
};