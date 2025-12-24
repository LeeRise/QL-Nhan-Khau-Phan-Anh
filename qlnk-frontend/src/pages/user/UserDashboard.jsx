import { useEffect, useState } from "react";
import { checkMyNhanKhau } from "../../api/user_nhankhau.api";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await checkMyNhanKhau();
      
      if (res.data.needsRegistration) {
        // Chưa khai báo, redirect đến trang khai báo
        navigate("/user/khaibao");
        return;
      }
      
      setUserInfo(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="user-page"><p>Đang tải...</p></div>;
  }

  return (
    <div className="user-page">
      <h1>👤 Thông tin cá nhân</h1>

      {!loading && userInfo && (
        <div className="info-card" style={{marginBottom: '20px', borderLeft: '4px solid #3498db', background: '#f0f9ff'}}>
          <h3 style={{color: '#2980b9', borderBottom: 'none', marginBottom: '5px'}}>🔔 Thông báo mới</h3>
          <p style={{margin: 0, fontSize: '14px'}}>
            Cán bộ vừa phản hồi kiến nghị của bạn. Vui lòng kiểm tra mục <strong>Phản ánh</strong> để xem dấu tích ✅ và nội dung chi tiết.
          </p>
        </div>
      )}
      
      {!userInfo ? (
        <div className="info-card">
          <p className="warning-text">
            ⚠️ Tài khoản của bạn chưa được liên kết với CCCD. 
            Vui lòng liên hệ quản trị viên để cập nhật thông tin.
          </p>
        </div>
      ) : (
        <div className="info-grid">
          <div className="info-card">
            <h3>📋 Thông tin cơ bản</h3>
            <div className="info-row">
              <label>Họ tên:</label>
              <span>{userInfo.Ho_Ten}</span>
            </div>
            <div className="info-row">
              <label>CCCD:</label>
              <span>{userInfo.Ma_CCCD || "Chưa có"}</span>
            </div>
            <div className="info-row">
              <label>Ngày sinh:</label>
              <span>{userInfo.Ngay_Sinh}</span>
            </div>
            <div className="info-row">
              <label>Giới tính:</label>
              <span>{userInfo.Gioi_Tinh}</span>
            </div>
          </div>

          <div className="info-card">
            <h3>🏠 Thông tin hộ khẩu</h3>
            <div className="info-row">
              <label>Địa chỉ thường trú:</label>
              <span>{userInfo.DC_TT || "Chưa có"}</span>
            </div>
            <div className="info-row">
              <label>Quê quán:</label>
              <span>{userInfo.Que_Quan || "Chưa có"}</span>
            </div>
            <div className="info-row">
              <label>Trạng thái:</label>
              <span className={`badge ${
                userInfo.Trang_Thai === 'Đang sống' ? 'badge-success' : 'badge-warning'
              }`}>
                {userInfo.Trang_Thai}
              </span>
            </div>
          </div>

          <div className="info-card">
            <h3>💼 Thông tin khác</h3>
            <div className="info-row">
              <label>Email:</label>
              <span>{userInfo.Email || "Chưa có"}</span>
            </div>
            <div className="info-row">
              <label>Nghề nghiệp:</label>
              <span>{userInfo.Nghe_Nghiep || "Chưa có"}</span>
            </div>
            <div className="info-row">
              <label>Tình trạng hôn nhân:</label>
              <span>{userInfo.TT_Hon_Nhan || "Chưa có"}</span>
            </div>
          </div>
        </div>
      )}


      <div className="action-section">
        <h2>⚡ Hành động nhanh</h2>
        <div className="action-grid">
          <a href="/user/biendong" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Đăng ký biến động</h3>
            <p>Tạm trú, tạm vắng, thay đổi thông tin</p>
          </a>
          <a href="/user/phananh" className="action-card">
            <div className="action-icon">📝</div>
            <h3>Gửi phản ánh</h3>
            <p>Phản ánh vấn đề với chính quyền</p>
          </a>
        </div>
      </div>
    </div>

      
  );
}
