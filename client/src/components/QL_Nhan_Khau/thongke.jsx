import { Link } from "react-router-dom";
import "../styles/Management.css"; // Dùng chung file css

const ThongKePage = () => {
  const thongKeItems = [
    { label: "Thống kê dân số", path: "/can-bo/thong-ke-nhan-khau" },
    { label: "Thống kê tạm trú/tạm vắng", path: "/can-bo/thong-ke-tam-tru/vang" },
  ];

  return (
    <div className="stats-dashboard-container10">
      <h1>Thống kê dân số</h1>
      <div className="stats-grid10">
        {thongKeItems.map((item, index) => (
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

export default ThongKePage;