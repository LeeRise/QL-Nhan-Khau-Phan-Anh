import { useEffect, useState } from "react";
import { getAllNhanKhau } from "../../api/nhankhau.api";
import { getAllHoKhau } from "../../api/hokhau.api";
import { getAllPhanAnh } from "../../api/phananh.api";
import { getAllBienDong } from "../../api/biendong.api";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNhanKhau: 0,
    totalHoKhau: 0,
    totalPhanAnh: 0,
    pendingPhanAnh: 0,
    hoKhauTonTai: 0,
    hoKhauChuyen: 0,
    nhanKhauNam: 0,
    nhanKhauNu: 0,
    nhanKhauDangSong: 0,
    totalBienDong: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [nhankhauRes, hokhauRes, phananhRes, biendongRes] = await Promise.all([
        getAllNhanKhau(),
        getAllHoKhau(),
        getAllPhanAnh(),
        getAllBienDong()
      ]);

      const nhankhauData = nhankhauRes.data.data;
      const hokhauData = hokhauRes.data.data;
      const phananhData = phananhRes.data.data;
      const biendongData = biendongRes.data.data;

      const pendingCount = phananhData.filter(
        pa => pa.Trang_Thai === "Chưa Tiếp nhận"
      ).length;

      const hoKhauTonTai = hokhauData.filter(
        hk => hk.Tinh_Trang === "Tồn tại"
      ).length;

      const hoKhauChuyen = hokhauData.filter(
        hk => hk.Tinh_Trang !== "Tồn tại"
      ).length;

      const nhanKhauNam = nhankhauData.filter(
        nk => nk.Gioi_Tinh === "Nam"
      ).length;

      const nhanKhauNu = nhankhauData.filter(
        nk => nk.Gioi_Tinh === "Nữ"
      ).length;

      const nhanKhauDangSong = nhankhauData.filter(
        nk => nk.Trang_Thai === "Đang sống"
      ).length;

      setStats({
        totalNhanKhau: nhankhauData.length,
        totalHoKhau: hokhauData.length,
        totalPhanAnh: phananhData.length,
        pendingPhanAnh: pendingCount,
        hoKhauTonTai,
        hoKhauChuyen,
        nhanKhauNam,
        nhanKhauNu,
        nhanKhauDangSong,
        totalBienDong: biendongData.length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalNhanKhau}</h3>
            <p>Tổng nhân khẩu</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h3>{stats.totalHoKhau}</h3>
            <p>Tổng hộ khẩu</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.totalPhanAnh}</h3>
            <p>Tổng phản ánh</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.pendingPhanAnh}</h3>
            <p>Phản ánh chưa xử lý</p>
          </div>
        </div>
      </div>

      {/* Thống kê chi tiết hộ khẩu */}
      <div className="detail-stats">
        <h2 style={{marginBottom: '20px', color: '#2c3e50'}}>📊 Thống kê chi tiết</h2>
        
        <div className="stats-section">
          <h3 style={{color: '#16a085', marginBottom: '15px'}}>🏠 Hộ khẩu</h3>
          <div className="mini-stats-grid">
            <div className="mini-stat-card" style={{borderLeft: '4px solid #27ae60'}}>
              <div className="mini-stat-number">{stats.hoKhauTonTai}</div>
              <div className="mini-stat-label">Hộ khẩu tồn tại</div>
            </div>
            <div className="mini-stat-card" style={{borderLeft: '4px solid #95a5a6'}}>
              <div className="mini-stat-number">{stats.hoKhauChuyen}</div>
              <div className="mini-stat-label">Hộ khẩu đã chuyển</div>
            </div>
          </div>
        </div>

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
            <div className="mini-stat-card" style={{borderLeft: '4px solid #e74c3c'}}>
              <div className="mini-stat-number">{stats.totalNhanKhau - stats.nhanKhauDangSong}</div>
              <div className="mini-stat-label">Đã mất/Chuyển đi</div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h3 style={{color: '#f39c12', marginBottom: '15px'}}>📈 Biến động</h3>
          <div className="mini-stats-grid">
            <div className="mini-stat-card" style={{borderLeft: '4px solid #f39c12'}}>
              <div className="mini-stat-number">{stats.totalBienDong}</div>
              <div className="mini-stat-label">Tổng biến động</div>
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h2>🎯 Chức năng chính</h2>
          <ul>
            <li>✅ Quản lý thông tin nhân khẩu</li>
            <li>✅ Quản lý hộ khẩu</li>
            <li>✅ Tiếp nhận và xử lý phản ánh</li>
            <li>✅ Theo dõi biến động dân cư</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
