import { useState } from "react";
import { login as loginApi } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await loginApi({ username, password });
      console.log('Login response:', res.data);

      if (res.data.success) {
        const userRole = res.data.role;
        const userToken = res.data.token;
        
        console.log('Logging in with role:', userRole);
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
      console.error('❌ Login error:', err);
      console.error('Error details:', err.response?.data);
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏘️ QLNK</h1>
          <p>Hệ thống Quản lý Nhân khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>👤 Tên đăng nhập</label>
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Đăng nhập
          </button>

          <div className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </form>

        <div className="login-footer">
          <p>© 2025 Hệ thống QLNK</p>
        </div>
      </div>
    </div>
  );
}
