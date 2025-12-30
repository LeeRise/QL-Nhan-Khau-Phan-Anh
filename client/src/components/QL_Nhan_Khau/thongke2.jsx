import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResidenceStats } from '../redux/qlNhanKhau';
import '../styles/thongke.css';

const ResidenceFluctuationPage = () => {
    const dispatch = useDispatch();
    const { residenceStats, loading } = useSelector((state) => state.qlnhankhau);

    const [queryParams, setQueryParams] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        loai: 'Tất cả'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [jumpPage, setJumpPage] = useState('');
    const rowsPerPage = 20;

    useEffect(() => {
        dispatch(getResidenceStats(queryParams));
        
    }, []);


    const handleFetch = () => {
        dispatch(getResidenceStats(queryParams));
        setCurrentPage(1);
    };

    const displayData = (residenceStats?.danhSachKetQua || []).filter(item => 
    item.Ho_Ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.Ma_CCCD.includes(searchTerm)
);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = displayData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(displayData.length / rowsPerPage);

    
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setJumpPage(''); // Reset ô nhập sau khi chuyển trang
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleJumpPage = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(jumpPage);
            if (pageNum >= 1 && pageNum <= totalPages) {
                paginate(pageNum);
            } else {
            }
        }
    };

    return (
        <div className="container11">
            <div className="card11">
                <div className="header11">
                    <div>
                        <h2>Thống kê Tạm trú & Tạm vắng</h2>
                        <p>Quản lý và tra cứu thông tin biến động cư trú của nhân khẩu</p>
                    </div>
                </div>

                <div className="filter-section11">
                    <div className="filter-grid11">
                        <div className="filter-group11">
                            <small>Từ ngày</small>
                            <input type="date" className="input11" value={queryParams.startDate} onChange={(e) => setQueryParams({ ...queryParams, startDate: e.target.value })} />
                        </div>
                        <div className="filter-group11">
                            <small>Đến ngày</small>
                            <input type="date" className="input11" value={queryParams.endDate} onChange={(e) => setQueryParams({ ...queryParams, endDate: e.target.value })} />
                        </div>
                        <div className="filter-group11">
                            <small>Loại hình</small>
                            <select className="select11" value={queryParams.loai} onChange={(e) => setQueryParams({ ...queryParams, loai: e.target.value })}>
                                <option value="Tất cả">Tất cả</option>
                                <option value="Tạm trú">Tạm trú</option>
                                <option value="Tạm vắng">Tạm vắng</option>
                            </select>
                        </div>
                        <div className="filter-group11" style={{justifyContent: 'flex-end'}}>
                            <button className="btn-primary11" onClick={handleFetch}>Lọc dữ liệu</button>
                        </div>
                        <div className="filter-group11">
                            <small>Tìm kiếm nhanh</small>
                            <input placeholder="Tên hoặc số CCCD..." className="input11" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        </div>
                    </div>
                </div>

                <div className="summary-text11">
                    Tìm thấy: <span style={{ color: '#3b82f6' }}>{residenceStats?.count || 0}</span> bản ghi
                    {displayData.length > 0 && ` (Trang ${currentPage}/${totalPages})`}
                </div>

                {loading ? <p>Đang tải dữ liệu...</p> : (
                    <div className="table-wrapper11">
                        <table className="table11">
                            <thead>
                                <tr>
                                    <th>Loại</th>
                                    <th>Họ và Tên</th>
                                    <th>CCCD</th>
                                    <th>Ngày thực hiện</th>
                                    <th>Ngày kết thúc</th>
                                    <th>Địa chỉ/Nơi đến</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows?.length > 0 ? currentRows.map((item, idx) => (
                                    <tr key={indexOfFirstRow+idx+1}>
                                        <td>
                                            <span className={item.Loai_Bien_Dong === 'Tạm trú' ? 'badge-tam-tru11' : 'badge-tam-vang11'}>
                                                {item.Loai_Bien_Dong}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{item.Ho_Ten}</div>
                                            <small style={{ color: '#64748b' }}>NS: {new Date(item.Ngay_Sinh).toLocaleDateString('vi-VN')}</small>
                                        </td>
                                        <td>{item.Ma_CCCD}</td>
                                        <td>{new Date(item.Ngay_Thuc_Hien).toLocaleDateString('vi-VN')}</td>
                                        <td>{new Date(item.Ngay_Ket_Thuc).toLocaleDateString('vi-VN')}</td>
                                        <td>{item.Dia_Chi_Bien_Dong}</td>
                                        <td>{item.Email || <i style={{color: '#cbd5e1'}}>Trống</i>}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Không có dữ liệu nào được tìm thấy</td></tr>
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="pagination11">
                                <button 
                                    className="page-btn11"
                                    disabled={currentPage === 1}
                                    onClick={() => paginate(currentPage - 1)}
                                >
                                    Trước
                                </button>
                                
                                <span> {currentPage} / {totalPages}</span>

                                <button 
                                    className="page-btn11"
                                    disabled={currentPage === totalPages}
                                    onClick={() => paginate(currentPage + 1)}
                                >
                                    Sau
                                </button>
                                <div className="jump-page11" >
                                    <span>Đến trang:</span>
                                    <input 
                                        type="number" 
                                        className="input11" 
                                        value={jumpPage}
                                        onChange={(e) => setJumpPage(e.target.value)}
                                        onKeyDown={handleJumpPage}
                                        placeholder={`${currentPage}`}
                                    />
                                    <small style={{ marginLeft: '5px', color: '#666' }}>/ {totalPages}</small>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResidenceFluctuationPage;