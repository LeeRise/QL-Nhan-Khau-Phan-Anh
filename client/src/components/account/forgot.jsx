import { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    forgotPassStep1, 
    forgotPassStep2, 
    forgotPassStep3, 
    forgotPassStep4Verify,
    forgotPassStep5Final
} from '../redux/auth_redux';
import Header from '../Header';
import TextInput from '../input';
import { FaIdCard, FaEnvelope,FaUser,FaSync } from 'react-icons/fa';
import OtpInput from './otpinput';



const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { resetToken } = useSelector(state => state.authUser);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState(null);

    const [formData, setFormData] = useState({
        cccd: '', email: '', hoTen: '',
        ngaySinh: '', ngayCap: '', otpCode: '',
        newPassword: '', confirmNewPassword: ''
    });

    const [timer, setTimer] = useState(0); 
    useEffect(() => {
        let interval = null;
        if (step === 3 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval); 
    }, [step, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return ( <div className='Timer'> <p>0{mins}:{secs < 10 ? '0' : ''}{secs} </p></div>
    );
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(forgotPassStep1(formData.cccd, formData.email, setLoading, setLocalError, (res) => {
            setLoading(false);
            if (res && !res.error) {
                setStep(2);
            }
        }));
    };

    const handleStep2 = (e) => {
        e.preventDefault();
        if (!resetToken) {
            setLocalError("Phiên làm việc đã hết hạn, vui lòng thực hiện lại bước 1.");
            setStep(1);
            return;
        }

        dispatch(forgotPassStep2(formData.hoTen, formData.ngaySinh, formData.ngayCap, setLoading, setLocalError, (res) => {
            if (res && !res.error) {
                const newToken = res.tempToken; 
                handleSendOTP(newToken); 
            } else {
                setLocalError(res.message);
            }
        }, resetToken)); 
    };

    const handleSendOTP = (tokenToUse) => {
        const finalToken = tokenToUse || resetToken;

        dispatch(forgotPassStep3(finalToken, setLoading, setLocalError, (res) => {
            if (res && !res.error) {
                setLocalError(null);
                setTimer(120);
                setStep(3);
            }
        }));
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (formData.otpCode.length !== 6) {
            setLocalError("Vui lòng nhập mã OTP 6 số");
            return;
        }

        dispatch(forgotPassStep4Verify(formData.otpCode, setLoading, setLocalError, (res) => {
            if (res && !res.error) {
                setLocalError(null);
                setStep(4); 
            }
        }, resetToken));
    };

    const handleFinalReset = (e) => {
        e.preventDefault();
        dispatch(forgotPassStep5Final(formData.newPassword, formData.confirmNewPassword, setLoading, setLocalError, (res) => {
            if (res && !res.error) {
                alert("Đổi mật khẩu thành công!");
                navigate('/login');
            }
        }, resetToken));
    };

    return (
        <div className="logina">
            <div className='login-content'>
            <div className="login1">
                <h2 className="title">Quên mật khẩu</h2>
                {localError && <div className="error-message" >{localError.message || localError}</div>}

                {step === 1 && (
                    <form onSubmit={handleStep1}>
                        <p>Bước 1: Nhập thông tin tài khoản</p>
                        <TextInput icon={<FaIdCard />} name="cccd" placeholder="Nhập Mã CCCD" value={formData.cccd} onChange={handleChange} />
                        <TextInput icon ={<FaEnvelope/>} name="email" type="email" placeholder="Nhập Email " value={formData.email} onChange={handleChange} />
                        <button type="submit" className='btn-primary' disabled={loading}>Tiếp theo</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleStep2}>
                        <p>Bước 2: Xác thực danh tính</p>
                        <TextInput icon={<FaUser/>} name="hoTen" placeholder="Họ và tên" value={formData.hoTen} onChange={handleChange} />
                        <label>Ngày sinh:</label>
                        <TextInput name="ngaySinh" type="date" value={formData.ngaySinh} onChange={handleChange} />
                        <label>Ngày cấp CCCD:</label>
                        <TextInput name="ngayCap" type="date" value={formData.ngayCap} onChange={handleChange} />
                        <button type="submit" className='btn-primary' disabled={loading}>Xác nhận & Gửi OTP</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleVerifyOTP}>
                        <p>Bước 3: Nhập mã OTP</p>
                        <div className={`otp-timer ${timer === 0 ? 'expired' : ''}`} >
            
                            <span>Mã hết hạn sau: {formatTime(timer)}</span>
            
            
                        </div>
                        <OtpInput 
                            length={6} 
                            onOtpChange={(value) => setFormData({ ...formData, otpCode: value })} 
                        />
                        <button type="submit" className='btn-primary'>Xác thực mã</button><br/>
                        <div className='btn-sync-container'>
                        <button type="button" className='btn-sync' onClick={() => handleSendOTP()} > <FaSync/> Gửi lại mã</button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={handleFinalReset}>
                        <p>Bước 4: Đặt lại mật khẩu</p>
                        <TextInput name="newPassword" type="password" placeholder="Mật khẩu mới" value={formData.newPassword} onChange={handleChange} />
                        <TextInput name="confirmNewPassword" type="password" placeholder="Nhắc lại mật khẩu" value={formData.confirmNewPassword} onChange={handleChange} />
                        <button type="submit" className='btn-primary' disabled={loading}>Hoàn tất</button>
                    </form>
                )}
            </div>
            </div>
        </div>
    );
};

export default ForgotPassword;