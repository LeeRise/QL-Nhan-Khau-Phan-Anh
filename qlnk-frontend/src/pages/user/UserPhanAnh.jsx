import { useEffect, useState } from "react";
import { getMyPhanAnh, createMyPhanAnh } from "../../api/phananh.api";
import { useNavigate } from "react-router-dom";
import "../admin/AdminHoKhau.css";

export default function UserPhanAnh() {
  const [data, setData] = useState([]);
  const [needsInfo, setNeedsInfo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Tieu_De: "",
    Loai_Van_De: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
      const submitData = new FormData();
      submitData.append('Tieu_De', formData.Tieu_De);
      submitData.append('Loai_Van_De', formData.Loai_Van_De);
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }
      
      await createMyPhanAnh(submitData);
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
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn ảnh dưới 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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

            <div className="form-group">
              <label>Hình ảnh minh họa (tùy chọn)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{padding: '8px'}}
              />
              <small style={{color: '#7f8c8d', display: 'block', marginTop: '5px'}}>
                Chấp nhận file ảnh, tối đa 5MB
              </small>
              {imagePreview && (
                <div style={{marginTop: '15px', position: 'relative'}}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      display: 'block'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    style={{
                      marginTop: '10px',
                      padding: '5px 15px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Xóa ảnh
                  </button>
                </div>
              )}
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
              <th>Hình ảnh</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>
                  Bạn chưa có phản ánh nào
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <>
                  <tr key={item.Ma_PA}>
                    <td>{item.Ma_PA}</td>
                    <td>
                      {item.Tieu_De}
                      {item.Phan_Hoi && (
                        <button 
                          onClick={() => setExpandedRow(expandedRow === item.Ma_PA ? null : item.Ma_PA)}
                          style={{
                            marginLeft: '10px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {expandedRow === item.Ma_PA ? '▲ Ẩn' : '▼ Xem phản hồi'}
                        </button>
                      )}
                    </td>
                    <td>{item.Loai_Van_De || "Chưa phân loại"}</td>
                    <td>{new Date(item.Ngay_PA).toLocaleString('vi-VN')}</td>
                    <td>
                      {item.Hinh_Anh ? (
                        <a 
                          href={`http://localhost:3001${item.Hinh_Anh}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{color: '#3498db', textDecoration: 'none'}}
                        >
                          🖼️ Xem ảnh
                        </a>
                      ) : (
                        <span style={{color: '#95a5a6'}}>Không có</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.Trang_Thai)}`}>
                        {item.Trang_Thai}
                      </span>
                    </td>
                  </tr>
                  {expandedRow === item.Ma_PA && item.Phan_Hoi && (
                    <tr>
                      <td colSpan="6" style={{background: '#e8f5e9', padding: '20px'}}>
                        <div style={{background: 'white', padding: '15px', borderRadius: '8px', border: '2px solid #2e7d32'}}>
                          <h4 style={{marginTop: 0, color: '#2e7d32'}}>💬 Phản hồi từ quản trị viên:</h4>
                          <p style={{margin: 0, color: '#2c3e50', lineHeight: '1.6'}}>{item.Phan_Hoi}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
