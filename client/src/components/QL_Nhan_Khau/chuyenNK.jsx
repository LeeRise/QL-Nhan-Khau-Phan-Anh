import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHouseholdMembers, memberDeparture, resetStatus } from '../redux/qlNhanKhau';
import '../styles/chuyenNk.css'
const MemberDeparturePage = () => {
    const dispatch = useDispatch();
    const { householdMembers, loading, error, success, message } = useSelector(state => state.qlnhankhau);

    const [search, setSearch] = useState({ type: 'maHK', value: '' });
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [newOwnerCCCD, setNewOwnerCCCD] = useState('');
    const [relations, setRelations] = useState({});
    const [formData, setFormData] = useState({
        lyDo: 'Chuyển đi nơi khác',
        ngayThucHien: new Date().toISOString().split('T')[0],
        noiDen: '',
        Ghi_Chu: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.value.trim()) return alert("Vui lòng nhập thông tin tìm kiếm");
        dispatch(getHouseholdMembers({ [search.type]: search.value }));
        setSelectedPerson(null);
        setNewOwnerCCCD('');
        setRelations({});
    };

    const onSelectPerson = (person) => {
        setSelectedPerson(person);
        setNewOwnerCCCD('');
        setRelations({});
    };

    const handleNewOwnerSelect = (cccd) => {
        if (!selectedPerson) return;
        setNewOwnerCCCD(cccd);
        const initialRels = {};
        householdMembers
            .filter(m => m.Ma_CCCD !== selectedPerson?.Ma_CCCD)
            .forEach(m => {
                initialRels[m.Ma_CCCD] = (m.Ma_CCCD === cccd) ? 'Chủ hộ' : '';
            });
        setRelations(initialRels);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedPerson) return;

        const isOwner = selectedPerson.Quan_He === 'Chủ hộ';
        const isLastMember = householdMembers.length === 1;

        const payload = {
            cccd: selectedPerson.Ma_CCCD,
            maHK: selectedPerson.Ma_HK,
            ...formData,
        };

        if (isOwner && !isLastMember) {
            const relArray = Object.keys(relations).map(key => ({ 
                cccd: key, 
                quanHe: relations[key] 
            }));
            
            if (!newOwnerCCCD) return ;
            if (relArray.some(r => !r.quanHe)) return ;
            
            payload.cccdChuHoMoi = newOwnerCCCD;
            payload.danhSachQuanHeMoi = relArray;
        }

        dispatch(memberDeparture(payload));
    };

    useEffect(() => {
        if (success) {
            dispatch(resetStatus());
            setSelectedPerson(null);
            dispatch(getHouseholdMembers({ [search.type]: search.value }));
        }
    }, [success, dispatch, search]);

    return (
        <div className="departure-page-6">
            <h1 className="page-title-6">Thủ tục Chuyển đi / Khai tử</h1>

            {/* PHẦN TÌM KIẾM */}
            <form onSubmit={handleSearch} className="search-box-6">
                <div className="input-group-6">
                    <label>TÌM THEO</label>
                    <select 
                        className="select-custom-6"
                        value={search.type} 
                        onChange={e => setSearch({...search, type: e.target.value})}
                    >
                        <option value="maHK">Mã Hộ Khẩu</option>
                        <option value="cccdChuHo">CCCD Chủ Hộ</option>
                        <option value="HotenChuHo">Họ tên Chủ Hộ</option>
                    </select>
                </div>
                <div className="input-group-6 expand-6">
                    <label>THÔNG TIN</label>
                    <input 
                        className="input-custom-6"
                        placeholder="Nhập thông tin cần tìm..." 
                        value={search.value} 
                        onChange={e => setSearch({...search, value: e.target.value})} 
                    />
                </div>
                <button type="submit" className="btn-search-6">TÌM KIẾM</button>
            </form>

            <div className="main-layout-6">
                {/* BÊN TRÁI: DANH SÁCH */}
                <div className="list-section-6">
                    <div className="section-header-6">Thành viên trong hộ</div>
                    <table className="data-table-6">
                        <thead>
                            <tr>
                                <th>Họ Tên</th>
                                <th>Quan Hệ</th>
                                <th className="text-center6">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {householdMembers?.length > 0 ? (
                                householdMembers.map(m => (
                                    <tr key={m.Ma_CCCD} className={selectedPerson?.Ma_CCCD === m.Ma_CCCD ? "active-row-6" : ""}>
                                        <td className="font-semibold6">{m.Ho_Ten}</td>
                                        <td>
                                            <span className={m.Quan_He === 'Chủ hộ' ? "owner-tag-6" : "member-tag-6"}>
                                                {m.Quan_He}
                                            </span>
                                        </td>
                                        <td className="text-center6">
                                            <button 
                                                type="button"
                                                onClick={() => onSelectPerson(m)} 
                                                className={`btn-action-6 ${selectedPerson?.Ma_CCCD === m.Ma_CCCD ? "selected" : ""}`}
                                            >
                                                {selectedPerson?.Ma_CCCD === m.Ma_CCCD ? "Đang chọn" : "Chọn"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="empty-row-6">Nhập thông tin để hiển thị danh sách thành viên</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* BÊN PHẢI: FORM XỬ LÝ */}
                <div className="form-section-6">
                    {selectedPerson ? (
                        <div className="departure-form-6">
                            <h2 className="form-header-6">
                                XỬ LÝ: <span>{selectedPerson.Ho_Ten}</span>
                                <small>Mã HK: {selectedPerson.Ma_HK}</small>
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="grid-2-cols-6">
                                    <div className="field-6">
                                        <label>LÝ DO XỬ LÝ</label>
                                        <select value={formData.lyDo} onChange={e => setFormData({...formData, lyDo: e.target.value})}>
                                            <option value="Chuyển đi nơi khác">Chuyển đi nơi khác</option>
                                            <option value="Đã qua đời">Đã qua đời</option>
                                            <option value="Đi nghĩa vụ quân sự">Đi nghĩa vụ quân sự</option>
                                        </select>
                                    </div>
                                    <div className="field-6">
                                        <label>NGÀY THỰC HIỆN</label>
                                        <input type="date" value={formData.ngayThucHien} onChange={e => setFormData({...formData, ngayThucHien: e.target.value})} />
                                    </div>
                                </div>

                                <div className="field-6">
                                    <label>ĐỊA CHỈ NƠI ĐẾN (NẾU CÓ)</label>
                                    <input value={formData.noiDen} onChange={e => setFormData({...formData, noiDen: e.target.value})} placeholder="Xã/Phường, Quận/Huyện..." />
                                </div>
                                <div className="field-6">
                                    <label>GHI CHÚ BỔ SUNG</label>
                                    <input value={formData.Ghi_Chu} onChange={e => setFormData({...formData, Ghi_Chu: e.target.value})} placeholder="Thông tin chi tiết..." />
                                </div>

                                {/* LOGIC CHỦ HỘ */}
                                {selectedPerson.Quan_He === 'Chủ hộ' && (
                                    <div className="owner-change-box-6">
                                        {householdMembers.length > 1 ? (
                                            <>
                                                <p className="warning-text-6"> Chủ hộ rời đi: Cần chỉ định người thay thế</p>
                                                <div className="field-6">
                                                    <label>CHỌN CHỦ HỘ MỚI</label>
                                                    <select 
                                                        value={newOwnerCCCD} 
                                                        onChange={e => handleNewOwnerSelect(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Chọn thành viên thay thế --</option>
                                                        {householdMembers?.filter(m => m.Ma_CCCD !== selectedPerson?.Ma_CCCD).map(m => (
                                                            <option key={m.Ma_CCCD} value={m.Ma_CCCD}>{m.Ho_Ten}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {newOwnerCCCD && (
                                                    <div className="relations-update-6">
                                                        <label className="label-blue-6">CẬP NHẬT QUAN HỆ VỚI CHỦ MỚI</label>
                                                        {householdMembers?.filter(m => m.Ma_CCCD !== selectedPerson?.Ma_CCCD).map(m => (
                                                            <div key={m.Ma_CCCD} className="rel-input-row-6">
                                                                <span>{m.Ho_Ten}</span>
                                                                <input 
                                                                    className={m.Ma_CCCD === newOwnerCCCD ? "disabled-input-6" : "highlight-input-6"}
                                                                    placeholder="Vd: Vợ, Con..."
                                                                    value={relations[m.Ma_CCCD] || ''}
                                                                    onChange={e => setRelations({...relations, [m.Ma_CCCD]: e.target.value})}
                                                                    disabled={m.Ma_CCCD === newOwnerCCCD}
                                                                    required
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="info-text-6">ĐÂY LÀ THÀNH VIÊN CUỐI CÙNG. HỘ KHẨU SẼ ĐÓNG.</p>
                                        )}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="btn-submit-final-6">
                                    {loading ? "ĐANG GỬI DỮ LIỆU..." : "XÁC NHẬN HOÀN TẤT"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="empty-form-state-6">
                            <p>Chọn một nhân khẩu từ danh sách bên trái để bắt đầu thực hiện thủ tục</p>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-toast-6">{error}</div>}
        </div>
    );
};

export default MemberDeparturePage;