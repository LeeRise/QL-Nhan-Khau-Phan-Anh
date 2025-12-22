import { useEffect, useState } from "react";
import { getAllPhanAnh, createPhanAnh, updatePhanAnh, deletePhanAnh } from "../../api/phananh.api";
import { getAllNhanKhau } from "../../api/nhankhau.api";
import "../admin/AdminHoKhau.css";

export default function AdminPhanAnh() {
  const [data, setData] = useState([]);
  const [nhankhauList, setNhankhauList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Tieu_De: "",
    Loai_Van_De: "",
    Ma_CCCD: "",
    Trang_Thai: "Chưa Tiếp nhận"
  });

  useEffect(() => {
    loadData();
    loadNhanKhau();
  }, []);

  const loadData = async () => {
    try {
      const res = await getAllPhanAnh();
      setData(res.data.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadNhanKhau = async () => {
    try {
      const res = await getAllNhanKhau();
      setNhankhauList(res.data.data);
    } catch (error) {
      console.error("Error loading nhankhau:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePhanAnh(editingId, formData);
      } else {
        await createPhanAnh(formData);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.Ma_PA);
    setFormData({
      Tieu_De: item.Tieu_De,
      Loai_Van_De: item.Loai_Van_De || "",
      Ma_CCCD: item.Ma_CCCD || "",
      Trang_Thai: item.Trang_Thai
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản ánh này?")) return;
    try {
      await deletePhanAnh(id);
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      Tieu_De: "",
      Loai_Van_De: "",
      Ma_CCCD: "",
      Trang_Thai: "Chưa Tiếp nhận"
    });
    setEditingId(null);
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
        <h1>📝 Quản lý Phản ánh</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "❌ Đóng" : "➕ Thêm phản ánh"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "✏️ Sửa phản ánh" : "➕ Thêm phản ánh mới"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  required
                  value={formData.Tieu_De}
                  onChange={(e) => setFormData({...formData, Tieu_De: e.target.value})}
                  placeholder="VD: Vấn đề về vệ sinh môi trường"
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
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Người phản ánh (CCCD)</label>
                <select
                  value={formData.Ma_CCCD}
                  onChange={(e) => setFormData({...formData, Ma_CCCD: e.target.value})}
                >
                  <option value="">-- Chọn người phản ánh --</option>
                  {nhankhauList.map(nk => (
                    <option key={nk.Ma_CCCD} value={nk.Ma_CCCD}>
                      {nk.Ho_Ten} - {nk.Ma_CCCD}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.Trang_Thai}
                  onChange={(e) => setFormData({...formData, Trang_Thai: e.target.value})}
                >
                  <option value="Chưa Tiếp nhận">Chưa Tiếp nhận</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã xử lý">Đã xử lý</option>
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
              <th>Mã PA</th>
              <th>Tiêu đề</th>
              <th>Loại vấn đề</th>
              <th>Ngày phản ánh</th>
              <th>Người phản ánh</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center'}}>Chưa có dữ liệu</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.Ma_PA}>
                  <td>{item.Ma_PA}</td>
                  <td>{item.Tieu_De}</td>
                  <td>{item.Loai_Van_De || "Chưa xác định"}</td>
                  <td>{new Date(item.Ngay_PA).toLocaleString('vi-VN')}</td>
                  <td>{item.Ma_CCCD || "Ẩn danh"}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.Trang_Thai)}`}>
                      {item.Trang_Thai}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(item.Ma_PA)} className="btn-icon">🗑️</button>
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
