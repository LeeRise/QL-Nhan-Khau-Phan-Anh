import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏘️ QLNK</h2>
          <p>Quản lý nhân khẩu</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-link">
            📊 Dashboard
          </Link>
          <Link to="/admin/nhankhau" className="nav-link">
            👥 Nhân khẩu
          </Link>
          <Link to="/admin/hokhau" className="nav-link">
            🏠 Hộ khẩu
          </Link>
          <Link to="/admin/phananh" className="nav-link">
            📝 Phản ánh
          </Link>
          <Link to="/admin/biendong" className="nav-link">
            📈 Biến động
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
