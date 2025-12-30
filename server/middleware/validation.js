import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const isValidCCCD = (cccd)=>{
    return cccd && typeof cccd === 'string' && /^\d{12}$/.test(cccd);
}
const isValidEmail = (email) => {
    return email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const checkPassword = (password)=>{
    const strong = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        //dài it nhất 8 ký tự it nhất 1 chữ hoa it nhất 1 chữ thường 1 số và 1 ký wtuj đặc biệt
    );
    return strong.test(password);

};
export const validateUserLoginData = (req, res, next) => {
    const { cccd, mat_khau } = req.body;
    let errors = [];

    if (!isValidCCCD(cccd)) {
        errors.push('Mã CCCD không hợp lệ (phải là 12 chữ số).');
    }
    if (!mat_khau) {
        errors.push('Mật khẩu không được để trống');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu đăng nhập không hợp lệ.', errors });
    }
    next();
};
export const validateAssignRoleData = (req, res, next) => {
    const { cccd, maVT } = req.body;
    console.log("Dữ liệu nhận được:", { cccd, maVT });
    let errors = [];

    if (!isValidCCCD(cccd)) {
        errors.push('Mã CCCD của người được cấp quyền không hợp lệ.');
    }
    const roleNum = Number(maVT);
    if (isNaN(roleNum) || roleNum < 2 || roleNum > 6) { 
        errors.push('Mã Vai trò (maVT) phải là số từ 2 đến 6.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu cấp quyền không hợp lệ.', errors });
    }
    next();
};
// kiểm tra xem đúng email với cccd
export const validateResetPasswordStep1 = (req, res, next) => {
    const { cccd, email } = req.body;
    let errors = [];

    if (!isValidCCCD(cccd)) {
        errors.push('Mã CCCD không hợp lệ.');
    }
    if (!isValidEmail(email)) {
        errors.push('Email không hợp lệ.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu xác minh Bước 1 không hợp lệ.', errors });
    }
    next();
};
// kiểm tra họ tên ngày cấp căn cước 
export const validateNhanKhauVerification = (req, res, next) => {
    const tempToken = req.headers.authorization?.split(' ')[1];
    if (!tempToken) {
        return res.status(401).json({ message: 'Không tìm thấy phiên xác thực.' });
    }
    
    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET,{
        ignoreExpiration: true,  // Bỏ qua lỗi hết hạn (Expired)
        ignoreNotBefore: true,   // Bỏ qua lỗi token đến từ tương lai (NotBefore)
        clockTolerance: 0        // Không cần độ trễ
    }); 
        const cccd = decoded.cccd; 
        console.log(cccd);
        const { hoTen, ngaySinh, ngayCap } = req.body;
        let errors = [];

        
        if (!isValidCCCD(cccd)) {
            errors.push('CCCD không hợp lệ hoặc phiên làm việc đã hỏng.');
        }
        if (!hoTen || hoTen.trim().length < 3) {
            errors.push('Họ Tên không hợp lệ.');
        }
        if (!ngaySinh || !Date.parse(ngaySinh)) {
            errors.push('Ngày Sinh không hợp lệ.');
        }
        if (!ngayCap || !Date.parse(ngayCap)) {
            errors.push('Ngày cấp căn cước không hợp lệ.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Dữ liệu xác minh nhân khẩu không hợp lệ.', errors });
        }

        req.body.cccd = cccd; 
        next();
    } catch (error) {
        console.error("LỖI XÁC THỰC TẠI MIDDLEWARE:", error);
        return res.status(401).json({ message: 'Phiên xác thực không hợp lệ hoặc đã hết hạn.' });
    }
};

export const validateMatKhauQuen = (req, res, next) => {
    const { newPassword, confirmNewPassword } = req.body;
    let errors = [];

    if (!newPassword || !checkPassword(newPassword)) {
        errors.push('Mật khẩu mới không hợp lệ!');
    }
    if (!confirmNewPassword ) {
        errors.push('Nhập lại mật khẩu không được để trống!');
    }
    if (newPassword!==confirmNewPassword) {
        errors.push('Mật khẩu mới không khớp vui lòng thử lại!');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu xác minh mật khẩu không hợp lệ!', errors });
    }
    next();
};
export const validateMatKhauDoi = (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let errors = [];

    if(!currentPassword){
        errors.push('Vui lòng nhập mật khẩu cũ.');
    }
    if (!newPassword|| !checkPassword(newPassword)) {
        errors.push('Mật khẩu mới không hợp lệ.');
    }
    if(currentPassword===newPassword){
        errors.push('Trùng với mật khẩu cũ.');
    }
    if (!confirmPassword ) {
        errors.push('Nhập lại mật khẩu không được để trống.');
    }
    if (newPassword!==confirmPassword) {
        errors.push('Mật khẩu mới không khớp vui lòng thử lại.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu xác minh mật khẩu không hợp lệ.', errors });
    }
    next();
};
 
export const validateAdminLoginData = (req, res, next) => {
    const { ten_dn, mat_khau } = req.body;
    let errors = [];

    if (!ten_dn || ten_dn.trim().length === 0) {
        errors.push('Tên đăng nhập không được để trống.');
    }
    if (!mat_khau) {
        errors.push('Mật khẩu không được để trống.');
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Dữ liệu đăng nhập Admin không hợp lệ.', errors });
    }
    next();
};