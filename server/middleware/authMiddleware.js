import jwt from 'jsonwebtoken'
import { checkUserExistence } from '../models/user.js'

const JWT_SECRET = process.env.JWT_SECRET;
export const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt || req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Phiên đăng nhập hết hạn hoặc không tồn tại.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã bị sửa đổi.' });
        }
        req.user = user; 
        next();
    });
};
export const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.Ma_VT)) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        next();
    };
};
export const checkPermissions = (requiredPermissions)=>{
    return (req, res, next)=>{
        const userPermissions = req.user.quyen || []
        const hasAllPermissions = requiredPermissions.every(permission=>
            userPermissions.includes(permission)
        );
        if(hasAllPermissions){
            next();
        } else {
            return res.status(403).json({message: 'Bạn không có quyền thực hiện theo tác này.'})
        }
    }
}