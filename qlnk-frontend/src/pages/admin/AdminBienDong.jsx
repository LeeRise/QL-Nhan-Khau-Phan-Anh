import { useEffect, useState } from "react";
import { getAllBienDong } from "../../api/biendong.api";
import "./AdminHoKhau.css";

export default function AdminBienDong() {
  const [bienDongList, setBienDongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoai, setFilterLoai] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBienDong();
  }, []);

  const fetchBienDong = async () => {
    try {
      const res = await getAllBienDong();
      setBienDongList(res.data.data || []);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  // Filter data
  const filteredData = bienDongList.filter(item => {
    const matchLoai = filterLoai === "Tất cả" || item.Loai_Bien_Dong === filterLoai;
    const matchSearch = !searchTerm || 
      item.Ho_Ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Ma_CCCD?.includes(searchTerm);
    return matchLoai && matchSearch;
  });

  // Get unique loại biến động for filter
  const loaiBienDong = ["Tất cả", ...new Set(bienDongList.map(bd => bd.Loai_Bien_Dong).filter(Boolean))];

  const getLoaiColor = (loai) => {
    switch(loai) {
      case "Tạm trú": return "#3498db";
      case "Tạm vắng": return "#f39c12";
      case "Đã mất": return "#e74c3c";
      case "Chuyển đi": return "#9b59b6";
      default: return "#95a5a6";
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📈 Quản lý Biến động dân cư</h1>
        <p style={{color: '#7f8c8d'}}>
          Tổng số: <strong>{bienDongList.length}</strong> biến động
        </p>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="form-row">
          <div className="form-group">
            <label>🔍 Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập họ tên hoặc CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>📋 Loại biến động</label>
            <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}>
              {loaiBienDong.map(loai => (
                <option key={loai} value={loai}>{loai}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {loaiBienDong.filter(l => l !== "Tất cả").map(loai => {
          const count = bienDongList.filter(bd => bd.Loai_Bien_Dong === loai).length;
          return (
            <div key={loai} style={{
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              borderLeft: `4px solid ${getLoaiColor(loai)}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{fontSize: '14px', color: '#7f8c8d', marginBottom: '5px'}}>
                {loai}
              </div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: getLoaiColor(loai)}}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>CCCD</th>
              <th>Loại biến động</th>
              <th>Ngày thực hiện</th>
              <th>Ngày kết thúc</th>
              <th>Địa chỉ cũ</th>
              <th>Địa chỉ mới</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((bd, index) => (
                <tr key={bd.Ma_BD}>
                  <td>{index + 1}</td>
                  <td>{bd.Ho_Ten || <span style={{color: '#95a5a6'}}>Chưa có</span>}</td>
                  <td>
                    <span style={{
                      background: '#ecf0f1',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {bd.Ma_CCCD || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: getLoaiColor(bd.Loai_Bien_Dong),
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {bd.Loai_Bien_Dong}
                    </span>
                  </td>
                  <td>{formatDate(bd.Ngay_Thuc_Hien)}</td>
                  <td>{formatDate(bd.Ngay_Ket_Thuc) || <span style={{color: '#95a5a6'}}>-</span>}</td>
                  <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {bd.DC_Cu || <span style={{color: '#95a5a6'}}>-</span>}
                  </td>
                  <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {bd.DC_Moi || <span style={{color: '#95a5a6'}}>-</span>}
                  </td>
                  <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {bd.Ghi_Chu || <span style={{color: '#95a5a6'}}>-</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{textAlign: 'center', padding: '40px', color: '#95a5a6'}}>
                  {searchTerm || filterLoai !== "Tất cả" 
                    ? "Không tìm thấy kết quả phù hợp"
                    : "Chưa có biến động nào được ghi nhận"
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#ecf0f1',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#7f8c8d'
        }}>
          Hiển thị <strong>{filteredData.length}</strong> / <strong>{bienDongList.length}</strong> biến động
        </div>
      )}
    </div>
  );
}
