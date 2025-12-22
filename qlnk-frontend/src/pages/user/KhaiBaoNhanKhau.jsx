import { useEffect, useState } from "react";
import { checkMyNhanKhau, updateMyNhanKhau } from "../../api/user_nhankhau.api";
import { useNavigate } from "react-router-dom";
import "../admin/AdminHoKhau.css";

export default function KhaiBaoNhanKhau() {
  const [formData, setFormData] = useState({
    Ma_CCCD: "",
    Ho_Ten: "",
    Ngay_Sinh: "",
    Ngay_Cap_CC: "",
    Noi_Cap: "",
    DC_TT: "",
    Gioi_Tinh: "Nam",
    Email: "",
    Que_Quan: "",
    Noi_Sinh: "",
    TT_Hon_Nhan: "Độc thân",
    Bi_Danh: "",
    Nghe_Nghiep: "",
    Noi_Lam_Viec: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingInfo();
  }, []);

  const checkExistingInfo = async () => {
    try {
      const res = await checkMyNhanKhau();
      if (res.data.hasInfo && res.data.data) {
        // Đã có thông tin, redirect về dashboard
        navigate("/user");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyNhanKhau(formData);
      alert("Khai báo thông tin thành công!");
      navigate("/user");
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (loading) {
    return <div className="admin-page"><p>Đang kiểm tra thông tin...</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📝 Khai báo thông tin nhân khẩu</h1>
      </div>

      <div className="form-card" style={{borderLeft: '4px solid #16a085'}}>
        <h2>Vui lòng điền đầy đủ thông tin của bạn</h2>
        <p style={{color: '#7f8c8d', marginBottom: '20px'}}>
          Thông tin này sẽ được sử dụng cho các thủ tục hành chính và quản lý dân cư.
        </p>

        <form onSubmit={handleSubmit}>
          <h3 style={{marginTop: 0, color: '#16a085'}}>Thông tin cơ bản</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                required
                value={formData.Ho_Ten}
                onChange={(e) => setFormData({...formData, Ho_Ten: e.target.value})}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label>Bí danh (nếu có)</label>
              <input
                value={formData.Bi_Danh}
                onChange={(e) => setFormData({...formData, Bi_Danh: e.target.value})}
                placeholder="Tên thường gọi"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày sinh *</label>
              <input
                type="date"
                required
                value={formData.Ngay_Sinh}
                onChange={(e) => setFormData({...formData, Ngay_Sinh: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Giới tính *</label>
              <select
                required
                value={formData.Gioi_Tinh}
                onChange={(e) => setFormData({...formData, Gioi_Tinh: e.target.value})}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <h3 style={{marginTop: 25, color: '#16a085'}}>Căn cước công dân</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Số CCCD *</label>
              <input
                required
                value={formData.Ma_CCCD}
                onChange={(e) => setFormData({...formData, Ma_CCCD: e.target.value})}
                placeholder="Nhập số CCCD (9-12 chữ số)"
                maxLength="12"
                pattern="[0-9]{9,12}"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày cấp</label>
              <input
                type="date"
                value={formData.Ngay_Cap_CC}
                onChange={(e) => setFormData({...formData, Ngay_Cap_CC: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Nơi cấp</label>
              <input
                value={formData.Noi_Cap}
                onChange={(e) => setFormData({...formData, Noi_Cap: e.target.value})}
                placeholder="VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
              />
            </div>
          </div>

          <h3 style={{marginTop: 25, color: '#16a085'}}>Địa chỉ</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Địa chỉ thường trú</label>
              <input
                value={formData.DC_TT}
                onChange={(e) => setFormData({...formData, DC_TT: e.target.value})}
                placeholder="Số nhà, đường, phường, quận, thành phố"
              />
            </div>

            <div className="form-group">
              <label>Quê quán</label>
              <input
                value={formData.Que_Quan}
                onChange={(e) => setFormData({...formData, Que_Quan: e.target.value})}
                placeholder="Tỉnh/Thành phố quê quán"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nơi sinh</label>
            <input
              value={formData.Noi_Sinh}
              onChange={(e) => setFormData({...formData, Noi_Sinh: e.target.value})}
              placeholder="Nơi sinh"
            />
          </div>

          <h3 style={{marginTop: 25, color: '#16a085'}}>Thông tin cá nhân</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.Email}
                onChange={(e) => setFormData({...formData, Email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Tình trạng hôn nhân</label>
              <select
                value={formData.TT_Hon_Nhan}
                onChange={(e) => setFormData({...formData, TT_Hon_Nhan: e.target.value})}
              >
                <option value="Độc thân">Độc thân</option>
                <option value="Đã kết hôn">Đã kết hôn</option>
                <option value="Ly hôn">Ly hôn</option>
                <option value="Góa">Góa</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nghề nghiệp</label>
              <input
                value={formData.Nghe_Nghiep}
                onChange={(e) => setFormData({...formData, Nghe_Nghiep: e.target.value})}
                placeholder="VD: Kỹ sư, Giáo viên, Sinh viên..."
              />
            </div>

            <div className="form-group">
              <label>Nơi làm việc</label>
              <input
                value={formData.Noi_Lam_Viec}
                onChange={(e) => setFormData({...formData, Noi_Lam_Viec: e.target.value})}
                placeholder="Tên công ty/trường học/cơ quan"
              />
            </div>
          </div>

          <div className="form-actions" style={{marginTop: 30}}>
            <button type="submit" className="btn-primary" style={{background: '#16a085', fontSize: '16px', padding: '15px 40px'}}>
              ✅ Hoàn tất khai báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
