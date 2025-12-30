import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getHouseholdMembers, 
    splitHousehold, 
    resetStatus, 
    clearHouseholdData 
} from '../redux/qlNhanKhau';
import '../styles/tackKhau.css'

const SplitHouseholdPage = () => {
    const dispatch = useDispatch();
    const { householdMembers, loading, error, success, message } = useSelector((state) => state.qlnhankhau);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('MaHK');

    const [maHKCu, setMaHKCu] = useState('');
    const [diaChiMoi, setDiaChiMoi] = useState('');
    const [maCCCDChuHoMoi, setMaCCCDChuHoMoi] = useState('');
    
    const [danhSachThanhVienMoi, setDanhSachThanhVienMoi] = useState([]);

    useEffect(() => {
        if (householdMembers?.length > 0) {
            setMaHKCu(householdMembers[0].Ma_HK);
        }
    }, [householdMembers]);

    
    useEffect(() => {
        return () => {
            dispatch(resetStatus());
            dispatch(clearHouseholdData());
        };
    }, [dispatch]);

    const isCurrentOwner = (member) => {
        return member.Quan_He === 'Chủ hộ';
    };
    useEffect(() => {
    if (success && message && !loading) {
        
        setSearchTerm('');
        setDiaChiMoi('');
        setMaCCCDChuHoMoi('');
        setDanhSachThanhVienMoi([]);
        setMaHKCu('');

        dispatch(clearHouseholdData());
        dispatch(resetStatus());
    }
}, [success, message, loading, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        setDanhSachThanhVienMoi([]);
        setMaCCCDChuHoMoi('');
        setDiaChiMoi('');
        const filters = { [searchType === 'MaHK' ? 'maHK' : searchType === 'CCCD' ? 'cccdChuHo' : 'HotenChuHo']: searchTerm };
        dispatch(getHouseholdMembers(filters));
    };

    const handleCheckboxChange = (member) => {
        if (isCurrentOwner(member)) return;
        const cccd = member.Ma_CCCD;
        setDanhSachThanhVienMoi(prev => {
            const exists = prev.find(item => item.cccd === cccd);
            if (exists) return prev.filter(item => item.cccd !== cccd);
            return [...prev, { cccd, quanHe: 'Thành viên' }];
        });
    };

    const handleQuanHeChange = (cccd, value) => {
        setDanhSachThanhVienMoi(prev => 
            prev.map(item => item.cccd === cccd ? { ...item, quanHe: value } : item)
        );
    };

    const handleSplitSubmit = (e) => {
        e.preventDefault();
        if (danhSachThanhVienMoi.length === 0) return alert("Vui lòng chọn ít nhất 1 thành viên.");
        if (!maCCCDChuHoMoi) return alert("Vui lòng chọn chủ hộ mới.");

        const finalData = {
            MaHKCu: maHKCu,
            MaCCCD_ChuHoMoi: maCCCDChuHoMoi,
            DiaChiMoi: diaChiMoi,
            DanhSachThanhVien: danhSachThanhVienMoi.map(m => ({
                cccd: m.cccd,
                quanHe: m.cccd === maCCCDChuHoMoi ? 'Chủ hộ' : m.quanHe
            }))
        };

        dispatch(splitHousehold(finalData));
    };

    return (
        <div className="split-page2">
            <div className="split-page__container2">
                <h1 className="split-page__title2">Nghiệp vụ Tách Hộ Khẩu</h1>

                {/*I */}
                <div className="split-page__section split-page__section--search2">
                    <h2 className="section__title2">I. Tìm kiếm hộ khẩu gốc</h2>
                    <form onSubmit={handleSearch} className="search-form2">
                        <select 
                            className="search-form__select2"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="MaHK">Mã hộ khẩu</option>
                            <option value="CCCD">CCCD Chủ hộ</option>
                            <option value="TenChuHo">Tên Chủ hộ</option>
                        </select>
                        <input 
                            type="text"
                            placeholder="Nhập thông tin tra cứu..."
                            className="search-form__input2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="search-form__btn2">
                            Truy xuất
                        </button>
                    </form>
                </div>

                <div className="split-page__content-grid2">
                    {/* II*/}
                    <div className="split-page__section split-page__section--members2">
                        <h2 className="section__title2">II. Chọn thành viên & Thiết lập quan hệ</h2>
                        <div className="table-wrapper2">
                            <table className="member-table2">
                                <thead className="member-table__head2">
                                    <tr>
                                        <th className="member-table__th member-table__th--check2">Chọn</th>
                                        <th className="member-table__th2">Họ Tên</th>
                                        <th className="member-table__th2">Quan hệ cũ</th>
                                        <th className="member-table__th2">Quan hệ hộ mới</th>
                                    </tr>
                                </thead>
                                <tbody className="member-table__body2">
                                    {householdMembers.length > 0 ? (
                                        householdMembers.map((member) => {
                                            const itemInNewList = danhSachThanhVienMoi.find(m => m.cccd === member.Ma_CCCD);
                                            const isChecked = !!itemInNewList;
                                            const isSelectedAsOwner = member.Ma_CCCD === maCCCDChuHoMoi;
                                            const isOwnerOfOldHousehold = isCurrentOwner(member);

                                            return (
                                                <tr key={member.Ma_CCCD} className={`member-table__tr2 ${isChecked ? 'member-table__tr--selected' : ''}`}>
                                                    <td className="member-table__td member-table__td--check2">
                                                        <input 
                                                            type="checkbox"
                                                            className="member-table__checkbox2"
                                                            checked={isChecked}
                                                            disabled={isOwnerOfOldHousehold}
                                                            onChange={() => handleCheckboxChange(member)}
                                                        />
                                                    </td>
                                                    <td className="member-table__td2">
                                                        <div className="member-table__name2">{member.Ho_Ten}</div>
                                                        <div className="member-table__subtext2">{member.Ma_CCCD}</div>
                                                    </td>
                                                    <td className="member-table__td member-table__td--old-rel2">{member.Quan_He}</td>
                                                    <td className="member-table__td2">
                                                        {isChecked ? (
                                                            <input 
                                                                type="text"
                                                                className={`member-table__input2 ${isSelectedAsOwner ? 'member-table__input--disabled' : ''}`}
                                                                value={isSelectedAsOwner ? 'Chủ hộ' : itemInNewList.quanHe}
                                                                disabled={isSelectedAsOwner}
                                                                onChange={(e) => handleQuanHeChange(member.Ma_CCCD, e.target.value)}
                                                                placeholder="VD: Vợ, Con, Cháu..."
                                                            />
                                                        ) : (
                                                            <span className="member-table__placeholder">Chưa chọn</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="member-table__empty2">
                                                Vui lòng tìm kiếm hộ khẩu để hiển thị thành viên
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* III */}
                    <div className="split-page__section split-page__section--info2">
                        <h2 className="section__title2">III. Thông tin hộ mới</h2>
                        <form onSubmit={handleSplitSubmit} className="split-form2">
                            <div className="split-form__group2">
                                <label className="split-form__label2">Địa chỉ cư trú mới</label>
                                <textarea 
                                    className="split-form__textarea2"
                                    placeholder="Số nhà, đường, tổ/thôn, xã/phường..."
                                    required
                                    value={diaChiMoi}
                                    onChange={(e) => setDiaChiMoi(e.target.value)}
                                />
                            </div>

                            <div className="split-form__group2">
                                <label className="split-form__label2">Chủ hộ mới là ai?</label>
                                <select 
                                    className="split-form__select2"
                                    required
                                    value={maCCCDChuHoMoi}
                                    onChange={(e) => setMaCCCDChuHoMoi(e.target.value)}
                                >
                                    <option value=""> Chọn từ danh sách </option>
                                    {householdMembers
                                        .filter(m => danhSachThanhVienMoi.some(item => item.cccd === m.Ma_CCCD))
                                        .map(m => (
                                            <option key={m.Ma_CCCD} value={m.Ma_CCCD}>{m.Ho_Ten}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="split-form__actions2">
                                <button 
                                    type="submit"
                                    disabled={loading || danhSachThanhVienMoi.length === 0}
                                    className={`split-form__submit-btn2 ${loading || danhSachThanhVienMoi.length === 0 ? 'split-form__submit-btn--disabled' : ''}`}
                                >
                                    {loading ? 'Đang thực thi...' : 'Xác nhận Tách hộ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitHouseholdPage;