import { useEffect, useState } from "react";
import { getAllNhanKhau, createNhanKhau, updateNhanKhau, deleteNhanKhau } from "../../api/nhankhau.api";
import { getAllHoKhau } from "../../api/hokhau.api";
import "./AdminHoKhau.css";

export default function AdminNhanKhau() {
  const [data, setData] = useState([]);
  const [hokhauList, setHokhauList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    Ma_CCCD: "",
    Ma_HK: "",
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
    Noi_Lam_Viec: "",
    Trang_Thai: "Đang sống"
  });

  useEffect(() => {
    loadData();
    loadHoKhau();
  }, []);

  const loadData = async () => {
    try {
      const res = await getAllNhanKhau(searchQuery);
      setData(res.data.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadHoKhau = async () => {
    try {
      const res = await getAllHoKhau();
      setHokhauList(res.data.data);
    } catch (error) {
      console.error("Error loading hokhau:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateNhanKhau(editingId, formData);
      } else {
        await createNhanKhau(formData);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.Ma_NK);
    setFormData({
      Ma_CCCD: item.Ma_CCCD || "",
      Ma_HK: item.Ma_HK || "",
      Ho_Ten: item.Ho_Ten,
      Ngay_Sinh: item.Ngay_Sinh,
      Ngay_Cap_CC: item.Ngay_Cap_CC || "",
      Noi_Cap: item.Noi_Cap || "",
      DC_TT: item.DC_TT || "",
      Gioi_Tinh: item.Gioi_Tinh,
      Email: item.Email || "",
      Que_Quan: item.Que_Quan || "",
      Noi_Sinh: item.Noi_Sinh || "",
      TT_Hon_Nhan: item.TT_Hon_Nhan || "Độc thân",
      Bi_Danh: item.Bi_Danh || "",
      Nghe_Nghiep: item.Nghe_Nghiep || "",
      Noi_Lam_Viec: item.Noi_Lam_Viec || "",
      Trang_Thai: item.Trang_Thai
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân khẩu này?")) return;
    try {
      await deleteNhanKhau(id);
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      Ma_CCCD: "",
      Ma_HK: "",
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
      Noi_Lam_Viec: "",
      Trang_Thai: "Đang sống"
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>👥 Quản lý Nhân khẩu</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "❌ Đóng" : "➕ Thêm nhân khẩu"}
        </button>
      </div>

      <div className="search-box">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "✏️ Sửa nhân khẩu" : "➕ Thêm nhân khẩu mới"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  required
                  value={formData.Ho_Ten}
                  onChange={(e) => setFormData({...formData, Ho_Ten: e.target.value})}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              <div className="form-group">
                <label>CCCD</label>
                <input
                  value={formData.Ma_CCCD}
                  onChange={(e) => setFormData({...formData, Ma_CCCD: e.target.value})}
                  placeholder="12 số"
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

            <div className="form-row">
              <div className="form-group">
                <label>Hộ khẩu</label>
                <select
                  value={formData.Ma_HK}
                  onChange={(e) => setFormData({...formData, Ma_HK: e.target.value})}
                >
                  <option value="">-- Chọn hộ khẩu --</option>
                  {hokhauList.map(hk => (
                    <option key={hk.Ma_HK} value={hk.Ma_HK}>
                      {hk.Ma_HK} - {hk.Dia_Chi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Địa chỉ thường trú</label>
                <input
                  value={formData.DC_TT}
                  onChange={(e) => setFormData({...formData, DC_TT: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input
                  value={formData.Nghe_Nghiep}
                  onChange={(e) => setFormData({...formData, Nghe_Nghiep: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.Trang_Thai}
                  onChange={(e) => setFormData({...formData, Trang_Thai: e.target.value})}
                >
                  <option value="Đang sống">Đang sống</option>
                  <option value="Đã mất">Đã mất</option>
                  <option value="Chuyển đi">Chuyển đi</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                💾 {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Mã NK</th>
              <th>Họ tên</th>
              <th>CCCD</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th>Nghề nghiệp</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="8" style={{textAlign: 'center'}}>Chưa có dữ liệu</td>
              </tr>
            ) : (
              data.map((nk) => (
                <tr key={nk.Ma_NK}>
                  <td>{nk.Ma_NK}</td>
                  <td>{nk.Ho_Ten}</td>
                  <td>{nk.Ma_CCCD || "Chưa có"}</td>
                  <td>{nk.Ngay_Sinh}</td>
                  <td>{nk.Gioi_Tinh}</td>
                  <td>{nk.Nghe_Nghiep || "Chưa có"}</td>
                  <td>
                    <span className={`badge ${
                      nk.Trang_Thai === 'Đang sống' ? 'badge-success' : 
                      nk.Trang_Thai === 'Đã mất' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {nk.Trang_Thai}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(nk)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(nk.Ma_NK)} className="btn-icon">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
