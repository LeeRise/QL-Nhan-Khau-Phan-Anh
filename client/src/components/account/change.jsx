import { changePassword } from "../redux/auth_redux";
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey, FaShieldAlt } from 'react-icons/fa';
import TextInput from "../input";
import Header from "../Header";
const ChangePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.authUser);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage("Mật khẩu mới không khớp!");
            setStatus("error");
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage("Mật khẩu mới phải có ít nhất 8 ký tự!");
            setStatus("error");
            return;
        }

        dispatch(changePassword(
            formData.currentPassword,
            formData.newPassword,
            formData.confirmPassword,
            setStatus,
            setMessage 
        ));
    };

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="logina">
            <div className="login-content">
            <div className="login1">
                <div className="card-header">
                    <FaShieldAlt size={60} className="icon-header" />
                    <h2>Đổi mật khẩu</h2>
                    <p>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="username" 
                        value={user?.Ma_CCCD || "current_user"} 
                        readOnly 
                        autoComplete="username" 
                        style={{ display: 'none' }} 
                    />

                    <div className="input-group">
                        <label>Mật khẩu hiện tại</label>
                        <TextInput 
                            icon={<FaKey className="input-icon" />}
                            type="password"
                            name="currentPassword"
                            id="form3"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Mật khẩu cũ"
                            autoComplete="current-password"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu mới</label>
                        <TextInput 
                            icon={<FaLock className="input-icon" />}
                            type="password"
                            name="newPassword"
                            id="form1"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Mật khẩu mới"
                            autoComplete="new-password"
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className="input-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <TextInput 
                            icon={<FaLock className="input-icon" />}
                            type="password"
                            name="confirmPassword"
                            id="form2"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                            disabled={status === 'loading'}
                        />
                    </div>

                    {status === 'error' && (
                        <div className="error-message">{message}</div>
                    )}

                    <p className="password-instruction">
                        Mật khẩu phải có ít nhất 8 ký tự bao gồm 1 ký tự in hoa, 1 ký tự in thường, 1 chữ số, 1 ký tự đặc biệt.
                    </p>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Đang xử lý' : 'Cập nhật mật khẩu'}
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
};

export default ChangePassword;