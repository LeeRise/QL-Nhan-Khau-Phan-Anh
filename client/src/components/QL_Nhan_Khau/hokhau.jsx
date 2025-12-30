import { Link } from "react-router-dom";
import "../styles/Management.css"; // Import file css chung

const ManagementPage = () => {
  const menuItems = [
    { label: "Đăng ký hộ khẩu mới", path: "/can-bo/thay-doi-ho-khau/1" },
    { label: "Tách hộ khẩu", path: "/can-bo/thay-doi-ho-khau/2" },
    { label: "Chuyển đi cả hộ", path: "/can-bo/thay-doi-ho-khau/3" },
    { label: "Thêm thành viên", path: "/can-bo/thay-doi-ho-khau/4" },
    { label: "Thay đổi thông tin Nhân khẩu", path: "/can-bo/thay-doi-ho-khau/5" },
    { label: "Thay đổi Nhân Khẩu (gồm chuyển đi/khai tử)", path: "/can-bo/thay-doi-ho-khau/6" },
    { label: "Đăng ký Tạm trú/ Tạm vắng", path: "/can-bo/thay-doi-ho-khau/7" },
  ];

  return (
    <div className="stats-dashboard-container10">
      <h1>Hệ thống Quản lý Nhân khẩu</h1>
      <div className="stats-grid10">
        {menuItems.map((item, index) => (
          <div key={index} className="stat-card10">
            <Link to={item.path} className="stat-link10">
              <div className="stat-content10">
                <span className="stat-label10">{item.label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagementPage;