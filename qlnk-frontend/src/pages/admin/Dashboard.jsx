import { useEffect, useState } from "react";
import { getGeneralStats } from "../../api/thongke.api"; // Sử dụng API mới
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNhanKhau: 0, totalHoKhau: 0, totalPhanAnh: 0, pendingPhanAnh: 0,
    hoKhauTonTai: 0, nhanKhauNam: 0, nhanKhauNu: 0, nhanKhauDangSong: 0,
    totalBienDong: 0, paAnNinh: 0, paMoiTruong: 0, paXaHoi: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getGeneralStats(); // Gọi 1 lần duy nhất thay vì Promise.all 4 lần
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      {/* Giữ nguyên Stats Grid cũ */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info"><h3>{stats.totalNhanKhau}</h3><p>Tổng nhân khẩu</p></div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🏠</div>
          <div className="stat-info"><h3>{stats.totalHoKhau}</h3><p>Tổng hộ khẩu</p></div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📝</div>
          <div className="stat-info"><h3>{stats.totalPhanAnh}</h3><p>Tổng phản ánh</p></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info"><h3>{stats.pendingPhanAnh}</h3><p>Phản ánh chưa xử lý</p></div>
        </div>
      </div>

      <div className="detail-stats">
        <h2 style={{marginBottom: '20px', color: '#2c3e50'}}>📊 Thống kê chi tiết</h2>
        
        {/* Phần 3 loại An ninh - Môi trường - Xã hội được chèn thêm vào */}
        <div className="stats-section">
          <h3 style={{color: '#e74c3c', marginBottom: '15px'}}>🚨 Phân loại Phản ánh</h3>
          <div className="mini-stats-grid">
            <div className="mini-stat-card" style={{borderLeft: '4px solid #e74c3c'}}>
              <div className="mini-stat-number">{stats.paAnNinh}</div>
              <div className="mini-stat-label">An ninh</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #2ecc71'}}>
              <div className="mini-stat-number">{stats.paMoiTruong}</div>
              <div className="mini-stat-label">Môi trường</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #3498db'}}>
              <div className="mini-stat-number">{stats.paXaHoi}</div>
              <div className="mini-stat-label">Xã hội</div>
            </div>
          </div>
        </div>

        {/* Khôi phục phần thống kê Hộ khẩu cũ */}
        <div className="stats-section">
          <h3 style={{color: '#16a085', marginBottom: '15px'}}>🏠 Hộ khẩu</h3>
          <div className="mini-stats-grid">
            <div className="mini-stat-card" style={{borderLeft: '4px solid #27ae60'}}>
              <div className="mini-stat-number">{stats.hoKhauTonTai}</div>
              <div className="mini-stat-label">Hộ khẩu tồn tại</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #95a5a6'}}>
              <div className="mini-stat-number">{stats.totalHoKhau - stats.hoKhauTonTai}</div>
              <div className="mini-stat-label">Hộ khẩu đã chuyển</div>
            </div>
          </div>
        </div>

        {/* Khôi phục phần thống kê Nhân khẩu cũ */}
        <div className="stats-section">
          <h3 style={{color: '#3498db', marginBottom: '15px'}}>👥 Nhân khẩu</h3>
          <div className="mini-stats-grid">
            <div className="mini-stat-card" style={{borderLeft: '4px solid #3498db'}}>
              <div className="mini-stat-number">{stats.nhanKhauNam}</div>
              <div className="mini-stat-label">Nam</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #e91e63'}}>
              <div className="mini-stat-number">{stats.nhanKhauNu}</div>
              <div className="mini-stat-label">Nữ</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #27ae60'}}>
              <div className="mini-stat-number">{stats.nhanKhauDangSong}</div>
              <div className="mini-stat-label">Đang sống</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}