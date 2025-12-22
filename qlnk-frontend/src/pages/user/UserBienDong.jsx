import { useEffect, useState } from "react";
import { getMyBienDong, createBienDong, updateMyStatus } from "../../api/biendong.api";
import { useNavigate } from "react-router-dom";
import "../admin/AdminHoKhau.css";

export default function UserBienDong() {
  const [data, setData] = useState([]);
  const [needsInfo, setNeedsInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Loai_Bien_Dong: "Tạm trú",
    DC_Moi: "",
    Ngay_Bat_Dau: "",
    Ngay_Ket_Thuc: "",
    Ghi_Chu: ""
  });
  const [statusData, setStatusData] = useState({
    Trang_Thai: "Chuyển đi",
    Ghi_Chu: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getMyBienDong();
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
      await createBienDong(formData);
      alert("Đăng ký biến động thành công!");
      resetForm();
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái thành "${statusData.Trang_Thai}"?`)) {
      return;
    }
    try {
      await updateMyStatus(statusData);
      alert("Cập nhật trạng thái thành công!");
      setShowStatusForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const resetForm = () => {
    setFormData({
      Loai_Bien_Dong: "Tạm trú",
      DC_Moi: "",
      Ngay_Bat_Dau: "",
      Ngay_Ket_Thuc: "",
      Ghi_Chu: ""
    });
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📋 Quản lý Biến động dân cư</h1>
        {!needsInfo && (
          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? "❌ Đóng" : "➕ Đăng ký biến động"}
            </button>
            <button onClick={() => setShowStatusForm(!showStatusForm)} className="btn-secondary" style={{background: '#e74c3c'}}>
              ⚠️ Cập nhật trạng thái
            </button>
          </div>
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
          <h2>➕ Đăng ký biến động mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Loại biến động *</label>
                <select
                  required
                  value={formData.Loai_Bien_Dong}
                  onChange={(e) => setFormData({...formData, Loai_Bien_Dong: e.target.value})}
                >
                  <option value="Tạm trú">Tạm trú</option>
                  <option value="Tạm vắng">Tạm vắng</option>
                </select>
              </div>

              <div className="form-group">
                <label>Địa chỉ mới *</label>
                <input
                  required
                  value={formData.DC_Moi}
                  onChange={(e) => setFormData({...formData, DC_Moi: e.target.value})}
                  placeholder="Nhập địa chỉ tạm trú/tạm vắng"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  required
                  value={formData.Ngay_Bat_Dau}
                  onChange={(e) => setFormData({...formData, Ngay_Bat_Dau: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc (tùy chọn)</label>
                <input
                  type="date"
                  value={formData.Ngay_Ket_Thuc}
                  onChange={(e) => setFormData({...formData, Ngay_Ket_Thuc: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={formData.Ghi_Chu}
                onChange={(e) => setFormData({...formData, Ghi_Chu: e.target.value})}
                placeholder="Ghi chú thêm (nếu có)"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                💾 Đăng ký
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {!needsInfo && showStatusForm && (
        <div className="form-card" style={{borderLeft: '4px solid #e74c3c'}}>
          <h2 style={{color: '#e74c3c'}}>⚠️ Cập nhật trạng thái nhân khẩu</h2>
          <p style={{color: '#e67e22', marginBottom: '20px'}}>
            Chức năng này dùng để báo cáo người mất hoặc chuyển đi vĩnh viễn. 
            Vui lòng cân nhắc kỹ trước khi thực hiện.
          </p>
          <form onSubmit={handleStatusSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Trạng thái *</label>
                <select
                  required
                  value={statusData.Trang_Thai}
                  onChange={(e) => setStatusData({...statusData, Trang_Thai: e.target.value})}
                >
                  <option value="Chuyển đi">Chuyển đi vĩnh viễn</option>
                  <option value="Đã mất">Đã mất</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú *</label>
              <textarea
                required
                value={statusData.Ghi_Chu}
                onChange={(e) => setStatusData({...statusData, Ghi_Chu: e.target.value})}
                placeholder="Nhập lý do, ngày tháng, địa điểm..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" style={{background: '#e74c3c'}}>
                💾 Xác nhận cập nhật
              </button>
              <button type="button" onClick={() => setShowStatusForm(false)} className="btn-secondary">
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {!needsInfo && (
        <div className="table-card">
          <h3 style={{padding: '15px', margin: 0, background: '#f8f9fa'}}>Lịch sử biến động</h3>
          <table>
          <thead>
            <tr>
              <th>Loại biến động</th>
              <th>Ngày thực hiện</th>
              <th>Ngày kết thúc</th>
              <th>Địa chỉ cũ</th>
              <th>Địa chỉ mới</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>
                  Chưa có biến động nào
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.Ma_BD}>
                  <td>
                    <span className={`badge ${
                      item.Loai_Bien_Dong === 'Tạm trú' ? 'badge-info' : 
                      item.Loai_Bien_Dong === 'Tạm vắng' ? 'badge-warning' :
                      item.Loai_Bien_Dong === 'Đã mất' ? 'badge-danger' : 'badge-success'
                    }`}>
                      {item.Loai_Bien_Dong}
                    </span>
                  </td>
                  <td>{item.Ngay_Thuc_Hien}</td>
                  <td>{item.Ngay_Ket_Thuc || "Không xác định"}</td>
                  <td>{item.DC_Cu || "—"}</td>
                  <td>{item.DC_Moi || "—"}</td>
                  <td>{item.Ghi_Chu || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
