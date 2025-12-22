import { useState } from "react";
import { register as registerApi } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const res = await registerApi({
        username: formData.username,
        password: formData.password
      });

      console.log('Register response:', res.data);

      if (res.data.success) {
        const userRole = res.data.role;
        const userToken = res.data.token;
        
        console.log('Auto login with role:', userRole);
        // Auto login sau khi đăng ký
        login(userToken, userRole);
        
        // Đợi một chút để state cập nhật
        setTimeout(() => {
          if (userRole === "SuperAdmin") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        }, 100);
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>📝 Đăng ký</h1>
          <p>Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>👤 Tên đăng nhập *</label>
            <input
              type="text"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Mật khẩu *</label>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Xác nhận mật khẩu *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Đăng ký
          </button>

          <div className="login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </form>

        <div className="register-footer">
          <p>© 2025 Hệ thống QLNK</p>
        </div>
      </div>
    </div>
  );
}
