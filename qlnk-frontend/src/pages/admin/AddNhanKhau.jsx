import { useState } from "react";
import { createNhanKhau } from "../../api/nhankhau.api";
import { useAuth } from "../../context/AuthContext";

export default function AddNhanKhau({ onSuccess }) {
  const [Ho_Ten, setHoTen] = useState("");
  const [Ngay_Sinh, setNgaySinh] = useState("");
  const [Gioi_Tinh, setGioiTinh] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNhanKhau({ Ho_Ten, Ngay_Sinh, Gioi_Tinh });
      alert("Thêm nhân khẩu thành công");
      onSuccess(); // reload list
    } catch {
      alert("Lỗi khi thêm nhân khẩu");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Thêm nhân khẩu</h3>

      <input
        placeholder="Họ tên"
        value={Ho_Ten}
        onChange={(e) => setHoTen(e.target.value)}
        required
      />

      <input
        type="date"
        value={Ngay_Sinh}
        onChange={(e) => setNgaySinh(e.target.value)}
        required
      />

      <select
        value={Gioi_Tinh}
        onChange={(e) => setGioiTinh(e.target.value)}
        required
      >
        <option value="">-- Giới tính --</option>
        <option value="Nam">Nam</option>
        <option value="Nữ">Nữ</option>
      </select>

      <button type="submit">Thêm</button>
    </form>
  );
}
