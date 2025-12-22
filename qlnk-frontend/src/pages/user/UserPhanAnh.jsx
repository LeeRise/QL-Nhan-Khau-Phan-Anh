import { useEffect, useState } from "react";
import { getMyPhanAnh, createMyPhanAnh } from "../../api/phananh.api";
import { useNavigate } from "react-router-dom";
import "../admin/AdminHoKhau.css";

export default function UserPhanAnh() {
  const [data, setData] = useState([]);
  const [needsInfo, setNeedsInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tieu_De: "",
    Loai_Van_De: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getMyPhanAnh();
      if (res.data.needsInfo) {
        setNeedsInfo(true);
        setData([]);
      } else {
        setNeedsInfo(false);
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMyPhanAnh(formData);
      alert("Gửi phản ánh thành công!");
      resetForm();
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const resetForm = () => {
    setFormData({
      Tieu_De: "",
      Loai_Van_De: ""
    });
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Chưa Tiếp nhận": "badge-warning",
      "Đang xử lý": "badge-info",
      "Đã xử lý": "badge-success"
    };
    return badges[status] || "badge-info";
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📝 Phản ánh của tôi</h1>
        {!needsInfo && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? "❌ Đóng" : "➕ Gửi phản ánh mới"}
          </button>
        )}
      </div>

      {needsInfo && (
        <div className="form-card" style={{borderLeft: '4px solid #f39c12', background: '#fff9e6'}}>
          <h2 style={{color: '#f39c12'}}>⚠️ Chưa khai báo thông tin</h2>
          <p style={{fontSize: '16px', marginBottom: '20px'}}>
            Bạn cần khai báo thông tin nhân khẩu (bao gồm số CCCD) trước khi sử dụng chức năng này.
          </p>
          <button 
            onClick={() => navigate('/user/khai-bao')} 
            className="btn-primary"
            style={{background: '#f39c12', fontSize: '16px', padding: '12px 30px'}}
          >
            📝 Đi đến trang khai báo
          </button>
        </div>
      )}

      {!needsInfo && showForm && (
        <div className="form-card">
          <h2>➕ Gửi phản ánh mới</h2>
          <p style={{color: '#7f8c8d', marginBottom: '20px'}}>
            Phản ánh của bạn sẽ được gửi đến ban quản lý và chỉ bạn và quản trị viên có thể xem.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                required
                value={formData.Tieu_De}
                onChange={(e) => setFormData({...formData, Tieu_De: e.target.value})}
                placeholder="VD: Vấn đề về vệ sinh môi trường khu vực..."
              />
            </div>

            <div className="form-group">
              <label>Loại vấn đề</label>
              <select
                value={formData.Loai_Van_De}
                onChange={(e) => setFormData({...formData, Loai_Van_De: e.target.value})}
              >
                <option value="">-- Chọn loại --</option>
                <option value="Hạ tầng">Hạ tầng</option>
                <option value="Vệ sinh">Vệ sinh</option>
                <option value="An ninh">An ninh</option>
                <option value="Dịch vụ công">Dịch vụ công</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                📤 Gửi phản ánh
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {!needsInfo && (
        <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Mã PA</th>
              <th>Tiêu đề</th>
              <th>Loại vấn đề</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                  Bạn chưa có phản ánh nào
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.Ma_PA}>
                  <td>{item.Ma_PA}</td>
                  <td>{item.Tieu_De}</td>
                  <td>{item.Loai_Van_De || "Chưa phân loại"}</td>
                  <td>{new Date(item.Ngay_PA).toLocaleString('vi-VN')}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.Trang_Thai)}`}>
                      {item.Trang_Thai}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}

      {!needsInfo && (
        <div className="info-card" style={{marginTop: '20px', background: '#e8f5e9'}}>
          <h3 style={{color: '#2e7d32', marginTop: 0}}>💡 Lưu ý</h3>
          <ul style={{margin: 0, paddingLeft: '20px', color: '#2c3e50'}}>
            <li>Phản ánh của bạn chỉ hiển thị cho bạn và quản trị viên</li>
            <li>Bạn sẽ nhận được thông báo khi phản ánh được xử lý</li>
            <li>Vui lòng mô tả rõ ràng vấn đề để được hỗ trợ tốt nhất</li>
          </ul>
        </div>
      )}
    </div>
  );
}
