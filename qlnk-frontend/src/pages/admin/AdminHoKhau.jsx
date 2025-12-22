import { useEffect, useState } from "react";
import { getAllHoKhau, createHoKhau, updateHoKhau, deleteHoKhau } from "../../api/hokhau.api";
import { getAllNhanKhau } from "../../api/nhankhau.api";
import "./AdminHoKhau.css";

export default function AdminHoKhau() {
  const [data, setData] = useState([]);
  const [nhankhauList, setNhankhauList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Dia_Chi: "",
    Ngay_Lap: "",
    CCCD_Chu_Ho: "",
    Tinh_Trang: "Tồn tại"
  });

  useEffect(() => {
    loadData();
    loadNhanKhau();
  }, []);

  const loadData = async () => {
    try {
      const res = await getAllHoKhau();
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
        await updateHoKhau(editingId, formData);
      } else {
        await createHoKhau(formData);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.Ma_HK);
    setFormData({
      Dia_Chi: item.Dia_Chi,
      Ngay_Lap: item.Ngay_Lap,
      CCCD_Chu_Ho: item.CCCD_Chu_Ho || "",
      Tinh_Trang: item.Tinh_Trang
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hộ khẩu này?")) return;
    try {
      await deleteHoKhau(id);
      loadData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      Dia_Chi: "",
      Ngay_Lap: "",
      CCCD_Chu_Ho: "",
      Tinh_Trang: "Tồn tại"
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🏠 Quản lý Hộ khẩu</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "❌ Đóng" : "➕ Thêm hộ khẩu"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "✏️ Sửa hộ khẩu" : "➕ Thêm hộ khẩu mới"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  required
                  value={formData.Dia_Chi}
                  onChange={(e) => setFormData({...formData, Dia_Chi: e.target.value})}
                  placeholder="VD: 123 Nguyễn Trãi, P.1, Q.5"
                />
              </div>

              <div className="form-group">
                <label>Ngày lập *</label>
                <input
                  type="date"
                  required
                  value={formData.Ngay_Lap}
                  onChange={(e) => setFormData({...formData, Ngay_Lap: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chủ hộ (CCCD)</label>
                <select
                  value={formData.CCCD_Chu_Ho}
                  onChange={(e) => setFormData({...formData, CCCD_Chu_Ho: e.target.value})}
                >
                  <option value="">-- Chọn chủ hộ --</option>
                  {nhankhauList.map(nk => (
                    <option key={nk.Ma_CCCD} value={nk.Ma_CCCD}>
                      {nk.Ho_Ten} - {nk.Ma_CCCD}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tình trạng</label>
                <select
                  value={formData.Tinh_Trang}
                  onChange={(e) => setFormData({...formData, Tinh_Trang: e.target.value})}
                >
                  <option value="Tồn tại">Tồn tại</option>
                  <option value="Đã giải thể">Đã giải thể</option>
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
              <th>Mã HK</th>
              <th>Địa chỉ</th>
              <th>Ngày lập</th>
              <th>Chủ hộ</th>
              <th>Tình trạng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center'}}>Chưa có dữ liệu</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.Ma_HK}>
                  <td>{item.Ma_HK}</td>
                  <td>{item.Dia_Chi}</td>
                  <td>{item.Ngay_Lap}</td>
                  <td>{item.CCCD_Chu_Ho || "Chưa có"}</td>
                  <td>
                    <span className={`badge ${item.Tinh_Trang === 'Tồn tại' ? 'badge-success' : 'badge-danger'}`}>
                      {item.Tinh_Trang}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(item.Ma_HK)} className="btn-icon">🗑️</button>
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
