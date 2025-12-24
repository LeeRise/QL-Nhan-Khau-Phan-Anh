import { useEffect, useState } from "react";
import { getAllPhanAnh, createPhanAnh, updatePhanAnh, deletePhanAnh, replyPhanAnh } from "../../api/phananh.api";
import { getAllNhanKhau } from "../../api/nhankhau.api";
import "./AdminHoKhau.css";

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
    } catch (error) { console.error(error); }
  };

  const loadNhanKhau = async () => {
    try {
      const res = await getAllNhanKhau();
      setNhankhauList(res.data.data);
    } catch (error) { console.error(error); }
  };

  const handleReply = async (id) => {
  const message = window.prompt("Nhập nội dung phản hồi gửi tới người dân:");
  if (!message) return; // Người dùng nhấn Hủy hoặc không nhập gì
  
  try {
    // Gọi API lưu vào bảng Phan_Hoi và đổi trạng thái sang "Đã xử lý"
    await replyPhanAnh(id, { Phan_Hoi: message, Trang_Thai: "Đã xử lý" });
    alert("Đã gửi phản hồi và cập nhật trạng thái thành công!");
    loadData(); // Tải lại danh sách
  } catch (err) {
    alert("Lỗi khi gửi phản hồi: " + (err.response?.data?.message || err.message));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await updatePhanAnh(editingId, formData); } 
      else { await createPhanAnh(formData); }
      resetForm();
      loadData();
    } catch (error) { alert("Lỗi thao tác"); }
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
    } catch (error) { alert("Lỗi khi xóa"); }
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Chưa Tiếp nhận": "badge-warning",
      "Đang xử lý": "badge-info",
      "Đã xử lý": "badge-success"
    };
    return badges[status] || "badge-info";
  };

  const resetForm = () => {
    setFormData({ Tieu_De: "", Loai_Van_De: "", Ma_CCCD: "", Trang_Thai: "Chưa Tiếp nhận" });
    setEditingId(null);
    setShowForm(false);
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
                <input required value={formData.Tieu_De} onChange={(e) => setFormData({...formData, Tieu_De: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Loại vấn đề</label>
                <select value={formData.Loai_Van_De} onChange={(e) => setFormData({...formData, Loai_Van_De: e.target.value})}>
                  <option value="">-- Chọn loại --</option>
                  <option value="An ninh">An ninh</option>
                  <option value="Môi trường">Môi trường</option>
                  <option value="Xã hội">Xã hội</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">💾 Lưu</button>
              <button type="button" onClick={resetForm} className="btn-secondary">❌ Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Người gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
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
                  {/* NÚT PHẢN HỒI MỚI - Chỉ hiện khi chưa xử lý xong */}
                  {item.Trang_Thai !== "Đã xử lý" && (
                    <button onClick={() => handleReply(item.Ma_PA)} className="btn-icon" title="Phản hồi & Tiếp nhận">✅</button>
                  )}
                  <button onClick={() => handleEdit(item)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDelete(item.Ma_PA)} className="btn-icon">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}