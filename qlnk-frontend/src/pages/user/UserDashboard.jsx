import { useEffect, useState } from "react";
import { checkMyNhanKhau } from "../../api/user_nhankhau.api";
import { getMyPhanAnh, createMyPhanAnh } from "../../api/phananh.api"; // Sử dụng trực tiếp API phản ánh
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [reportStats, setReportStats] = useState({ total: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // State để lưu thông tin hộ khẩu người dân tự nhập
  const [requestData, setRequestData] = useState({ Ma_HK: "", Dia_Chi: "" });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Chỉ gọi các API mà User có quyền truy cập
      const [userRes, reportsRes] = await Promise.all([
        checkMyNhanKhau(),
        getMyPhanAnh()
      ]);
      
      if (userRes.data.needsRegistration) {
        navigate("/user/khaibao");
        return;
      }
      
      setUserInfo(userRes.data.data);
      const reports = reportsRes.data.data || [];
      setReportStats({
        total: reports.length,
        resolved: reports.filter(r => r.Trang_Thai === "Đã xử lý").length
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestData.Ma_HK || !requestData.Dia_Chi) {
      alert("Vui lòng nhập đầy đủ Mã hộ khẩu và Địa chỉ!");
      return;
    }

    try {
      // Gửi yêu cầu dưới dạng một "Phản ánh" để Admin duyệt
      await createMyPhanAnh({
        Tieu_De: `Yêu cầu nhập khẩu vào hộ: ${requestData.Ma_HK}`,
        Loai_Van_De: "Xã hội", // Phân loại vào nhóm Xã hội để Admin dễ lọc
        Noi_Dung: `Tôi muốn xin gia nhập vào hộ khẩu mã số ${requestData.Ma_HK} tại địa chỉ: ${requestData.Dia_Chi}.`
      });
      
      alert("Yêu cầu đã được gửi thành công! Admin sẽ kiểm tra và phản hồi ✅");
      setShowRequestForm(false);
      setRequestData({ Ma_HK: "", Dia_Chi: "" });
      loadAllData(); // Cập nhật lại số lượng phản ánh trên Dashboard
    } catch (error) {
      alert("Lỗi khi gửi yêu cầu. Vui lòng thử lại!");
    }
  };

  if (loading) return <div className="user-page"><p>Đang tải...</p></div>;

  return (
    <div className="user-page">
      <h1>👤 Thông tin cá nhân</h1>

      {/* Box tóm tắt phản ánh giữ nguyên logic cũ */}
      <div className="info-card" style={{ marginBottom: '20px', borderLeft: '4px solid #f39c12', background: '#fff9e6' }}>
        <h3 style={{ color: '#e67e22', borderBottom: 'none', marginBottom: '10px' }}>📊 Tóm tắt phản ánh cá nhân</h3>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div><label>Tổng số đã gửi:</label> <div className="stat-num">{reportStats.total}</div></div>
          <div><label>Đã xử lý ✅:</label> <div className="stat-num" style={{color: '#27ae60'}}>{reportStats.resolved}</div></div>
        </div>
      </div>

      <div className="action-section">
        <h2>⚡ Dịch vụ công trực tuyến</h2>
        <div className="action-grid">
          <div onClick={() => setShowRequestForm(!showRequestForm)} className="action-card" style={{cursor: 'pointer', border: showRequestForm ? '2px solid #16a085' : ''}}>
            <div className="action-icon">🏘️</div>
            <h3>Yêu cầu nhập khẩu</h3>
            <p>Gửi yêu cầu xin gia nhập hộ gia đình</p>
          </div>
          <a href="/user/biendong" className="action-card"><div className="action-icon">📋</div><h3>Đăng ký biến động</h3></a>
          <a href="/user/phananh" className="action-card"><div className="action-icon">📝</div><h3>Gửi phản ánh</h3></a>
        </div>
      </div>

      {/* FORM NHẬP THÔNG TIN HỘ KHẨU MUỐN GIA NHẬP */}
      {showRequestForm && (
        <div className="form-card" style={{marginTop: '20px', borderTop: '4px solid #16a085'}}>
          <h3>📍 Thông tin hộ khẩu muốn gia nhập</h3>
          <form onSubmit={handleSendRequest}>
            <div className="form-group" style={{marginBottom: '10px'}}>
              <label>Mã hộ khẩu (Nếu biết):</label>
              <input 
                type="text" 
                value={requestData.Ma_HK} 
                onChange={(e) => setRequestData({...requestData, Ma_HK: e.target.value})}
                placeholder="Ví dụ: HK001"
              />
            </div>
            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Địa chỉ hộ khẩu *:</label>
              <input 
                required 
                type="text" 
                value={requestData.Dia_Chi} 
                onChange={(e) => setRequestData({...requestData, Dia_Chi: e.target.value})}
                placeholder="Nhập địa chỉ nhà muốn nhập khẩu vào"
              />
            </div>
            <button type="submit" className="btn-primary" style={{background: '#16a085'}}>Gửi yêu cầu duyệt</button>
          </form>
        </div>
      )}

      {/* Phần info-grid thông tin cá nhân cũ */}
      {userInfo && (
        <div className="info-grid">
           {/* ... Giữ nguyên các thẻ info-card cũ ... */}
        </div>
      )}
    </div>
  );
}