import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./UserLayout.css";

export default function UserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="user-layout">
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <h2>👤 QLNK</h2>
          <p>Người dân</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/user" className="nav-link">
            🏠 Trang chủ
          </Link>
          <Link to="/user/biendong" className="nav-link">
            📋 Biến động dân cư
          </Link>
          <Link to="/user/phananh" className="nav-link">
            📝 Phản ánh
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="user-main-content">
        <Outlet />
      </main>
    </div>
  );
}
