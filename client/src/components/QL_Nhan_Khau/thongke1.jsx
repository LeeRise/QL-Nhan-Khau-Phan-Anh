import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDemographicStats } from '../redux/qlNhanKhau';
import '../styles/thongke.css';

const DemographicStats = () => {
    const dispatch = useDispatch();
    const { demographicStats, loading, error } = useSelector((state) => state.qlnhankhau);

    const [filters, setFilters] = useState({
        hoTen: '', tuoiTu: '', tuoiDen: '', ngheNghiep: '', gioiTinh: '', ttHonNhan: '', trangThai: '',queQuan:'', dcTTTruoc:'',noiSinh:'',noiLamViec: '',ngayDKThuongTru:''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;
    useEffect(() => {
        dispatch(getDemographicStats());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const filteredData = Array.isArray(demographicStats) 
? demographicStats.filter(item => {
    const safeMatch = (itemValue, filterValue) => {
        if (!filterValue || filterValue.trim() === '') return true;
        if (!itemValue) return false; // Có search nhưng data lại trống thì không khớp
        return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
    };

    const matchName = safeMatch(item.Ho_Ten, filters.hoTen);
    const matchJob = safeMatch(item.Nghe_Nghiep, filters.ngheNghiep);
    const mathTTHN = safeMatch(item.TT_Hon_Nhan, filters.ttHonNhan);
    const mathTrangThai = !filters.trangThai || 
    item.Trang_Thai?.toLowerCase().includes(filters.trangThai.toLowerCase());
    const matchNoiSinh = safeMatch(item.Noi_Sinh, filters.noiSinh);
    const matchQueQuan = safeMatch(item.Que_Quan, filters.queQuan);
    const matchNoiLamViec = safeMatch(item.Noi_Lam_Viec, filters.noiLamViec);

    const matchGender = filters.gioiTinh === '' || item.Gioi_Tinh === filters.gioiTinh;

    const matchNgayDK = !filters.ngayDKThuongTru || 
        (item.Ngay_Dk_Thuong_Tru && item.Ngay_Dk_Thuong_Tru.startsWith(filters.ngayDKThuongTru));

    const age = item.Tuoi || (item.Ngay_Sinh ? new Date().getFullYear() - new Date(item.Ngay_Sinh).getFullYear() : 0);
    const matchAgeFrom = filters.tuoiTu === '' || age >= parseInt(filters.tuoiTu);
    const matchAgeTo = filters.tuoiDen === '' || age <= parseInt(filters.tuoiDen);

    return matchName && matchJob && matchGender && matchAgeFrom && matchAgeTo && 
           mathTTHN && mathTrangThai && matchNgayDK && 
           matchNoiSinh && matchQueQuan && matchNoiLamViec;
    }) : [];
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    

    return (
        <div className="container11">
            <div className="card11">
                <div className="header11">
                    <h2>Thống kê & Tìm kiếm Nhân khẩu</h2>
                    <button className="btn-refresh11" onClick={() => dispatch(getDemographicStats())}>
                        Tải lại dữ liệu
                    </button>
                </div>

                <div className="filter-section11">
                    <div className="summary-text11">Bộ lọc tìm kiếm</div>
                    <div className="filter-grid11">
                        <input className="input11" name="hoTen" placeholder="Họ tên..." value={filters.hoTen} onChange={handleInputChange} />
                        <input className="input11" name="tuoiTu" type="number" placeholder="Từ tuổi..." value={filters.tuoiTu} onChange={handleInputChange} />
                        <input className="input11" name="tuoiDen" type="number" placeholder="Đến tuổi..." value={filters.tuoiDen} onChange={handleInputChange} />
                        <select className="select11" name="gioiTinh" value={filters.gioiTinh} onChange={handleInputChange}>
                            <option value="">Tất cả giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                        <input className="input11" name="ngheNghiep" placeholder="Nghề nghiệp..." value={filters.ngheNghiep} onChange={handleInputChange} />
                        <input className="input11" name="noiLamViec" placeholder="Nơi làm việc..." value={filters.noiLamViec} onChange={handleInputChange} />
                        <input className="input11" name="queQuan" placeholder="Quê quán" value={filters.queQuan} onChange={handleInputChange} />
                        <input className="input11" name="noiSinh" placeholder="Nơi sinh" value={filters.noiSinh} onChange={handleInputChange} />
                        <input className="input11" name="trangThai" placeholder="Trạng thái" value={filters.trangThai} onChange={handleInputChange} />
                        <select className="select11" name="ttHonNhan" value={filters.ttHonNhan} onChange={handleInputChange}>
                            <option value="">Tất cả TT hôn nhân</option>
                            <option value="Độc thân">Độc Thân</option>
                            <option value="Đã kết hôn">Đã kết hôn</option>
                            <option value="Ly hôn">Ly hôn</option>
                        </select>
                        <br/>
                        <div className="filter-item">
        <label>Ngày ĐK thường trú:</label>
        <input 
            className="input11" 
            name="ngayDKThuongTru" 
            type="date" 
            value={filters.ngayDKThuongTru} 
            onChange={handleInputChange} 
        />
    </div>
                    </div>
                </div>

                <div className="summary-text11">
                    Tìm thấy: <span style={{color: '#3b82f6'}}>{filteredData?.length || 0}</span> kết quả
                    {filteredData.length > 0 && ` (Trang ${currentPage}/${totalPages})`}
                </div>

                {loading ? <p>Đang tải danh sách...</p> : error ? <p className="error11">Lỗi: {error}</p> : (
                    <div className="table-wrapper11">
                        <table className="table11">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>CCCD</th>
                                    <th>Họ và Tên</th>
                                    <th>Ngày sinh</th>
                                    <th>Giới tính</th>
                                    <th>Nghề nghiệp</th>
                                    <th>Địa chỉ thường trú</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? filteredData.map((item, index) => {
                                    const age = new Date().getFullYear() - new Date(item.Ngay_Sinh).getFullYear();
                                    return (
                                        <tr key={item.Ma_NK || index}>
                                            <td>{index + 1}</td>
                                            <td>{item.Ma_CCCD}</td>
                                            <td>
                                                <div style={{fontWeight: '700'}}>{item.Ho_Ten}</div>
                                                <small style={{ color: '#64748b' }}>{age} tuổi</small>
                                            </td>
                                            <td>{new Date(item.Ngay_Sinh).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <span className={item.Gioi_Tinh === 'Nam' ? 'badge-nam11' : 'badge-nu11'}>
                                                    {item.Gioi_Tinh}
                                                </span>
                                            </td>
                                            <td>{item.Nghe_Nghiep || 'Chưa cập nhật'}</td>
                                            <td>{item.DC_TT}</td>
                                            <td>
                                                <span className={item.Trang_Thai?.includes('Tạm') ? 'status-pending11' : 'status-active11'}>
                                                    {item.Trang_Thai}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>Không có dữ liệu phù hợp</td></tr>
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="pagination11">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => paginate(currentPage - 1)}
                                    className="page-btn11"
                                >
                                    &laquo; Trước
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i + 1} 
                                        onClick={() => paginate(i + 1)}
                                        className={`page-btn11 ${currentPage === i + 1 ? 'active-page11' : ''}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => paginate(currentPage + 1)}
                                    className="page-btn11"
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DemographicStats;