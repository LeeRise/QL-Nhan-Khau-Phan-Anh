import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS 
    }
});

export const sendEmailOTP = async (toEmail, otpCode) => {
    const mailOptions = {
        from: `Hệ thống QL Nhân Khẩu <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Mã Xác Thực OTP Đặt Lại Mật Khẩu',
        html: `
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Mã xác thực (OTP) của bạn là: <strong>${otpCode}</strong></p>
            <p>Mã này sẽ hết hạn trong 3 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ Hỗ trợ QLNK</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return false;
    }
};