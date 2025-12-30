import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchHouseholdMembersAction, clearSearchResult } from '../redux/nhankhau';
import { getHouseholdHistory,clearHouseholdData } from '../redux/qlNhanKhau';
import '../styles/searchHK.css'
const HouseholdSearch = () => {
    const dispatch = useDispatch();
    const { searchResult, searchStatus, searchError } = useSelector((state) => state.nhankhauCanhan);
    const { householdHistory } = useSelector((state) => state.qlnhankhau);

    const [filters, setFilters] = useState({ maHK: '', cccdChuHo: '', HotenChuHo: '' });
    const [selectedMember, setSelectedMember] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        return () =>{dispatch(clearSearchResult());
            dispatch(clearHouseholdData());
        }
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(clearSearchResult());
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        dispatch(searchHouseholdMembersAction(activeFilters));
        if (filters.maHK) {
            dispatch(getHouseholdHistory(filters.maHK));
        }
    };

    const openDetail = (member) => {
        setSelectedMember(member);
        setShowModal(true);
    };

    useEffect(() => {
        if (searchResult && searchResult.length > 0) {
            const maHK = Array.isArray(searchResult[0].Ma_HK) 
                         ? searchResult[0].Ma_HK[0] 
                         : searchResult[0].Ma_HK;
            dispatch(getHouseholdHistory(maHK));
        }
        else if (searchResult && searchResult.length === 0) {
        }
    }, [searchResult, dispatch]);

    const householdInfo = searchResult && searchResult.length > 0 ? searchResult[0] : null;
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';
    const display = (value) => value || <span className="no-data">Chưa cập nhật</span>;

    return (
        <main className="household-search-wrapper8">
            <h2 className="page-title8">Hệ thống Tra cứu Hộ khẩu</h2>

            {/* Section: Search Form */}
            <section className="search-filter-card8">
                <form onSubmit={handleSearch} className="search-form-grid8">
                    <div className="form-group8">
                        <label className="form-label8">Mã Hộ Khẩu</label>
                        <input type="number" className="form-input8" value={filters.maHK} onChange={(e) => setFilters({...filters, maHK: e.target.value})} placeholder="Nhập mã HK..." />
                    </div>
                    <div className="form-group8">
                        <label className="form-label">CCCD Chủ Hộ</label>
                        <input type="text" className="form-input8" value={filters.cccdChuHo} onChange={(e) => setFilters({...filters, cccdChuHo: e.target.value})} placeholder="Số định danh..." />
                    </div>
                    <div className="form-group8">
                        <label className="form-label8">Họ tên Chủ Hộ</label>
                        <input type="text" className="form-input8" value={filters.HotenChuHo} onChange={(e) => setFilters({...filters, HotenChuHo: e.target.value})} placeholder="Tên chủ hộ..." />
                    </div>
                    <button type="submit" className="btn-search-submit8">Tìm kiếm</button>
                </form>
            </section>

            {searchError && <div className="alert-error-message8">{searchError}</div>}

            {/* Section: Household Header Info */}
            {householdInfo && (
                <div className="info-summary-card8">
                    <div className="summary-header8">
                        <h3>Thông tin chung</h3>
                        <span className="badge-id8">Mã HK: {Array.isArray(householdInfo.Ma_HK) ? householdInfo.Ma_HK[0] : householdInfo.Ma_HK}</span>
                    </div>
                    <div className="summary-body8">
                        <div className="summary-item8">
                            <span className="item-label8">Chủ hộ:</span>
                            <span className="item-value highlight8">{householdInfo.Ten_Chu_Ho}</span>
                        </div>
                        <div className="summary-item full-width8">
                            <span className="item-label8">Địa chỉ:</span>
                            <span className="item-value8">{householdInfo.Dia_Chi}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Section: Results Table */}
            <section className="table-container8">
                <table className="data-table8">
                    <thead>
                        <tr>
                            <th>Mã HK</th>
                            <th>Thành viên</th>
                            <th>CCCD</th>
                            <th>Quan hệ</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchStatus === 'loading' ? (
                            <tr><td colSpan="5" className="text-center8 py-48">Đang truy vấn dữ liệu...</td></tr>
                        ) : searchResult.length > 0 ? (
                            searchResult.map((member, index) => (
                                <tr key={index}>
                                    <td className="font-bold8">{Array.isArray(member.Ma_HK) ? member.Ma_HK[0] : member.Ma_HK}</td>
                                    <td className="text-primary8 font-medium8">{member.Ho_Ten_Thanh_Vien}</td>
                                    <td>{member.CCCD_Thanh_Vien}</td>
                                    <td><span className="badge-relation8">{member.Quan_He}</span></td>
                                    <td>
                                        <button onClick={() => openDetail(member)} className="btn-action-detail8">
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center8  text8">Không tìm thấy kết quả phù hợp</td></tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Section: History Table */}
            {householdHistory?.length > 0 && (
                <section className="history-section8">
                    <h3 className="section-subtitle8">Lịch sử biến động hộ khẩu</h3>
                    <div className="table-container8 scrollable8">
                        <table className="data-table8 history-table8">
                            <thead>
                                <tr>
                                    <th>Thời gian Thực Hiện</th>
                                    <th>Thời gian Kết thúc</th>
                                    <th>Loại biến động</th>
                                    <th>Nhân khẩu</th>
                                    <th>Địa chỉ mới</th>
                                    <th>Địa chỉ cũ</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {householdHistory.map((history, idx) => (
                                    <tr key={idx}>
                                        <td className="date-cell8">{formatDate(history.Ngay_Thuc_Hien)}</td>
                                        <td className="date-cell8">{formatDate(history.Ngay_Ket_Thuc)}</td>
                                        <td>
                                            <span className={`status-pill ${history.Loai_Bien_Dong.includes('Chuyển đi') ? 'pill-warning' : 'pill-success'}`}>
                                                {history.Loai_Bien_Dong}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="member-info8">
                                                <strong>{history.Ho_Ten}</strong> <br/>
                                                <small>{history.Ma_CCCD}</small>
                                            </div>
                                        </td>
                                        <td>{display(history.DC_Moi)}</td>
                                        <td>{display(history.DC_Cu)}</td>
                                        <td>{display(history.Ghi_Chu)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* MODAL: Member Detail */}
            {showModal && selectedMember && (
                <div className="modal-overlay8" onClick={() => setShowModal(false)}>
                    <div className="modal-content-large8" onClick={e => e.stopPropagation()}>
                        <header className="modal-header8">
                            <h2 className="modal-title8">Hồ sơ Nhân khẩu Chi tiết</h2>
                            <button className="btn-modal-close8" onClick={() => setShowModal(false)}>×</button>
                        </header>
                        
                        <div className="modal-scroll-area8">
                            <div className="info-grid-container8">
                                <div className="status-banner8">
                                    <span className={selectedMember.Trang_Thai === 'Đang sống' ? 'badge-alive8' : 'badge-deceased8'}>
                                        Trạng thái: {selectedMember.Trang_Thai || 'Đang sống'}
                                    </span>
                                </div>

                                <section className="info-block8">
                                    <h4 className="block-title8">Thông tin định danh</h4>
                                    <div className="info-grid8">
                                        <InfoItem label="Họ và tên" value={selectedMember.Ho_Ten || selectedMember.Ho_Ten_Thanh_Vien} highlight />
                                        <InfoItem label="Số CCCD" value={selectedMember.Ma_CCCD || selectedMember.CCCD_Thanh_Vien} />
                                        <InfoItem label="Bí danh" value={display(selectedMember.Bi_Danh)} />
                                        <InfoItem label="Ngày sinh" value={formatDate(selectedMember.Ngay_Sinh)} />
                                        <InfoItem label="Ngày Cấp CCCD" value={formatDate(selectedMember.Ngay_Cap_CC)} />
                                        <InfoItem label="Nơi Cấp CCCD" value={selectedMember.Noi_Cap} />
                                        <InfoItem label="Giới tính" value={selectedMember.Gioi_Tinh} />
                                        <InfoItem label="Dân tộc" value={display(selectedMember.Dan_Toc)} />
                                    </div>
                                </section>

                                <section className="info-block8">
                                    <h4 className="block-title8">Cư trú & Nghề nghiệp</h4>
                                    <div className="info-grid8">
                                        <InfoItem label="Nghề nghiệp" value={display(selectedMember.Nghe_Nghiep)} />
                                        <InfoItem label="Nơi làm việc" value={display(selectedMember.Noi_Lam_Viec)} />
                                        <InfoItem label="Nơi sinh" value={display(selectedMember.Noi_Sinh)} />
                                        <InfoItem label="Mã Hộ Khẩu" value={Array.isArray(selectedMember.Ma_HK) ? selectedMember.Ma_HK[0] : selectedMember.Ma_HK} />
                                        <InfoItem label="Quan hệ chủ hộ" value={selectedMember.Quan_He} />
                                        <div className="info-card8 span-full8">
                                            <span className="card-label8">Địa chỉ thường trú</span>
                                            <span className="card-value8">{selectedMember.DC_TT}</span>
                                        </div>
                                        <div className="info-card8 span-full8">
                                            <span className="card-label8">Quê quán</span>
                                            <span className="card-value8">{selectedMember.Que_Quan}</span>
                                        </div>
                                        <div className="info-card8 span-full8">
                                            <span className="card-label8">Địa chỉ thường trú trước</span>
                                            <span className="card-value8">{selectedMember.DC_Thuong_Tru_Truoc}</span>
                                        </div>

                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

const InfoItem = ({ label, value, highlight = false }) => (
    <div className={`info-card8 ${highlight ? 'card-highlight8' : ''}`}>
        <span className="card-label8">{label}</span>
        <span className="card-value8">{value}</span>
    </div>
);

export default HouseholdSearch;