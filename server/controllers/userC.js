
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmailOTP } from '../utils/emailUtils.js'; 
import { 
    findUserByCCCD, 
    findAdminByUsername, 
    createOrUpdateOTP, 
    getOTPDetails, 
    updatePassword,
    deleteOTP,
    verifyNhanKhau 
} from '../models/user.js'

const checkPassword = (password)=>{
    const strong = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    return strong.test(password);

};
const JWT_SECRET = process.env.JWT_SECRET ; 

export const adminLogin = async (req, res) => {
    const { ten_dn, mat_khau } = req.body;
    let user = null;

    try {
        user = await findAdminByUsername(ten_dn);
        
        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập không tồn tại.' });
        }

        const isPasswordValid = await bcrypt.compare(mat_khau, user.Mat_Khau || '');
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        if (user.Ma_VT !== 1) {
             console.warn(`User (Ma_ND: ${user.Ma_ND}, Ma_VT: ${user.Ma_VT}) tried logging into admin portal.`);
            return res.status(403).json({ 
                message: 'Bạn không có quyền truy cập cổng quản trị. Vui lòng sử dụng cổng đăng nhập dành cho Cán bộ/Người dân.' 
            });
        }

        const tokenPayload = {
            Ma_ND: user.Ma_ND,
            Ma_VT: user.Ma_VT,
            Ma_CCCD: user.Ma_CCCD||null,
            quyen: user.quyen
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwt', token, {
        httpOnly: true, 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict', 
    });
        return res.status(200).json({ 
    success: true,
    Ma_VT: user.Ma_VT,
    message: 'Đăng nhập Admin thành công.' 
});
        

    } catch (error) {
        console.error("Admin Login error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình đăng nhập Admin.' });
    }
};
export const login = async (req, res) => {
    const {  mat_khau, cccd } = req.body;
    let user = null;

    try {
        
         if (cccd) {
            user = await findUserByCCCD(cccd);
            if (!user) {
                return res.status(401).json({ message: 'Mã CCCD không tồn tại.' });
            }
        } else {
            return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đăng nhập.' });
        }

        const isPasswordValid = await bcrypt.compare(mat_khau, user.Mat_Khau || '');
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }

        const tokenPayload = {
            Ma_ND: user.Ma_ND,
            Ma_VT: user.Ma_VT,
            Ma_CCCD: user.Ma_CCCD,
            quyen: user.quyen 
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwt', token, {
            httpOnly: true, 
            secure: false, 
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'strict', 
        });

        return res.status(200).json({ 
            Ma_VT: user.Ma_VT,
            message: 'Đăng nhập thành công.' 
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình đăng nhập.' });
    }
};

export const changePassword = async (req, res) => {
    const { Ma_CCCD } = req.user; 
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if(!checkPassword(newPassword)){
        return res.status(400).json({ message: 'Mật khẩu mới không hợp lệ.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu mới và mật khẩu nhắc lại không khớp.' });
    }
    try {
        const user = await findUserByCCCD(Ma_CCCD);

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.Mat_Khau);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác.' });
        }

        res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
        sameSite: 'strict',
        secure: false,
    });
        await updatePassword(Ma_CCCD, newPassword);


        return res.status(200).json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình đổi mật khẩu.' });
    }
};


export const forgotPasswordStep1 = async (req, res) => {
    const { cccd, email } = req.body;
    try {
        const nhanKhauVerified = await verifyNhanKhau({ cccd, email }); 

        if (!nhanKhauVerified) {
            return res.status(404).json({ message: 'CCCD hoặc Email không khớp.' });
        }
        
        const tempToken = jwt.sign({ cccd, step: 1 }, JWT_SECRET, { expiresIn: '5m' });

        return res.status(200).json({ 
            message: 'Xác thực bước 1 thành công. Vui lòng cung cấp thông tin danh tính.',
            tempToken: tempToken 
        });

    } catch (error) {
        console.error("Forgot password step 1 error:", error);
        return res.status(500).json({ message: 'Lỗi server.' });
    }
};

export const forgotPasswordStep2 = async (req, res) => {

    const { hoTen, ngaySinh, ngayCap } = req.body;
    const tempToken = req.headers.authorization?.split(' ')[1]; 

    if (!tempToken) {
        return res.status(401).json({ message: 'Không tìm thấy phiên xác thực.' });
    }

    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.step !== 1) {
            return res.status(403).json({ message: 'Trạng thái xác thực không hợp lệ.' });
        }
        const cccd = decoded.cccd;

        const identityVerified = await verifyNhanKhau({ cccd, hoTen, ngaySinh, ngayCap });

        if (!identityVerified) {
            return res.status(401).json({ message: 'Thông tin danh tính không chính xác.' });
        }

        const newTempToken = jwt.sign({ cccd, step: 2 }, JWT_SECRET, { expiresIn: '5m' });

        return res.status(200).json({ 
            message: 'Xác thực danh tính thành công. Sẵn sàng gửi OTP.',
            tempToken: newTempToken 
        });
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Phiên xác thực đã hết hạn.' });
        }
        console.error("Forgot password step 2 error:", error);
        return res.status(500).json({ message: 'Lỗi server.' });
    }
};
export const forgotPasswordStep3 = async (req, res) => {
    const tempToken = req.headers.authorization?.split(' ')[1];
    if (!tempToken) {
        return res.status(401).json({ message: 'Không tìm thấy phiên xác thực.' });
    }

    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET,{
        ignoreExpiration: true,  // Bỏ qua lỗi hết hạn (Expired)
        ignoreNotBefore: true,   // Bỏ qua lỗi token đến từ tương lai (NotBefore)
        clockTolerance: 0        // Không cần độ trễ
    }); 
        if (decoded.step !== 2 && decoded.step !==3) { 
            return res.status(403).json({ message: 'Chưa hoàn thành xác thực danh tính.' });
        }
        const cccd = decoded.cccd;

        const user = await findUserByCCCD(cccd);
        const email = user ? user.Email : null; 

        if (!email) {
            return res.status(404).json({ message: 'Không tìm thấy email liên kết.' });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 
        const expiryTime = new Date(Date.now() + 2 * 60 * 1000); 

        await createOrUpdateOTP(cccd, otpCode, expiryTime);

        const success = await sendEmailOTP(email, otpCode);

        if (!success) {
            return res.status(500).json({ message: 'Lỗi gửi mã OTP. Vui lòng thử lại sau.' });
        }

        const finalToken = jwt.sign({ cccd, step: 3 }, JWT_SECRET, { expiresIn: '5m' }); 

        return res.status(200).json({ 
            message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.',
            finalToken: finalToken
        });

    } catch (error) {
        console.error("Forgot password step 3 (Send OTP) error:", error);
        return res.status(500).json({ message: 'Lỗi server.' });
    }
};

// Bước 4 mới: Chỉ kiểm tra OTP
export const forgotPasswordVerifyOTP = async (req, res) => {
    const finalToken = req.headers.authorization?.split(' ')[1];
    const { otpCode } = req.body;

    if (!finalToken) return res.status(401).json({ message: 'Phiên làm việc không tồn tại.' });

    try {
        const decoded = jwt.verify(finalToken, JWT_SECRET);
        if (decoded.step !== 3) return res.status(403).json({ message: 'Trạng thái không hợp lệ.' });

        const cccd = decoded.cccd;
        const otpDetails = await getOTPDetails(cccd);

        if (!otpDetails || otpDetails.OTP_Code !== otpCode) {
            return res.status(401).json({ message: 'Mã OTP không chính xác.' });
        }

        if (otpDetails.OTP_Expiry < new Date()) {
            await deleteOTP(cccd);
            return res.status(401).json({ message: 'Mã OTP đã hết hạn.' });
        }

        // Tạo token mới cho Step 4 (đã xác thực OTP thành công)
        const nextStepToken = jwt.sign({ cccd, step: 4 }, JWT_SECRET, { expiresIn: '5m' });

        return res.status(200).json({ 
            message: 'Xác thực mã OTP thành công.', 
            tempToken: nextStepToken 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi xác thực OTP.' });
    }
};

// Bước 5: Đặt lại mật khẩu (Lúc này không cần gửi lại otpCode nữa)
export const forgotPasswordFinalReset = async (req, res) => {
    const tempToken = req.headers.authorization?.split(' ')[1];
    const { newPassword, confirmNewPassword } = req.body;

    if (!checkPassword(newPassword)) return res.status(400).json({ message: 'Mật khẩu không hợp lệ.' });
    if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'Mật khẩu không khớp.' });

    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.step !== 4) return res.status(403).json({ message: 'Vui lòng xác thực OTP trước.' });

        const cccd = decoded.cccd;
        
        await updatePassword(cccd, newPassword);
        await deleteOTP(cccd); // Xóa OTP sau khi dùng xong

        return res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu.' });
    }
};


export const getSessionInfo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Không có phiên đăng nhập hợp lệ.' });
    }
    
    const { Ma_ND, Ma_VT, Ma_CCCD, quyen } = req.user;
    console.log("Session User:", req.user);
    return res.status(200).json({ 
        Ma_ND, 
        Ma_VT, 
        Ma_CCCD, 
        quyen,
        message: 'Phiên đăng nhập hợp lệ.'
    });
};

export const logout =(req, res)=>{
    try{
    
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: false, 
            sameSite: 'strict'
        });

        return res.status(200).json({ message: "Đăng xuất thành công." });
    }
    catch(error){
        console.log('Error', error);
        res.status(500).json({message:'Internal server error during the registration process.'});
    }
}
export const getSessionInfo1 = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Không có phiên đăng nhập hợp lệ.' });
    }
    
    const { Ma_ND, Ma_VT, quyen } = req.user;
    
    return res.status(200).json({ 
        Ma_ND, 
        Ma_VT, 
        quyen,
        message: 'Phiên đăng nhập hợp lệ.'
    });
};