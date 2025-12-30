import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getHouseholdMembers, 
    moveEntireHousehold, 
    resetStatus, 
    clearHouseholdData 
} from '../redux/qlNhanKhau';
import '../styles/chuyenHo.css'
const MoveEntireHouseholdPage = () => {
    const dispatch = useDispatch();
    
    const { householdMembers, loading, error, success, message } = useSelector((state) => state.qlnhankhau);

    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        maHK: '',
        ngayChuyen: new Date().toISOString().split('T')[0],
        noiDen: '',
        lyDo: ''
    });

    useEffect(() => {
        dispatch(resetStatus());
    dispatch(clearHouseholdData());
        return () => {
            dispatch(resetStatus());
            dispatch(clearHouseholdData());
        };
    }, [dispatch]);
    useEffect(() => {
    if (success) {
        const timer = setTimeout(() => {
            dispatch(resetStatus());
        }, 1000); 
        return () => clearTimeout(timer);
    }
    if(error){
        const timer = setTimeout(() => {
            dispatch(resetStatus());
        }, 3000); 
        return () => clearTimeout(timer);
    }
}, [error,success, dispatch]);

    useEffect(() => {
        if (householdMembers?.length > 0) {
            setFormData(prev => ({ ...prev, maHK: householdMembers[0].Ma_HK }));
        }
    }, [householdMembers]);

    const [searchType, setSearchType] = useState('MaHK');

const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    let filters = {};
    if (searchType === 'MaHK') filters.maHK = searchTerm;
    else if (searchType === 'CCCD') filters.cccdChuHo = searchTerm;
    else filters.hoTenChuHo = searchTerm;

    dispatch(getHouseholdMembers(filters));
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.maHK) return alert("Vui lòng tìm hộ khẩu trước khi thực hiện.");
        dispatch(moveEntireHousehold(formData));
    };

    return (
        <div className="move-page3">
            <div className="move-page__container3">
                <header className="move-page__header3">
                    <h1 className="move-page__title3">Chuyển Đi Cả Hộ</h1>
                </header>

                <div className="move-page__grid3">
                    <div className="move-page__main-content3">
                        {/* Section 1: Search */}
                        <section className="card card--search3">
                            <h2 className="card__title3">
                                I. Tra cứu hộ khẩu
                            </h2>
                            <form onSubmit={handleSearch} className="search-form3">
                                <select 
                                    className="search-form__select3"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                >
                                    <option value="MaHK">Mã hộ khẩu</option>
                                    <option value="CCCD">CCCD Chủ hộ</option>
                                    <option value="hoTenChuHo">Tên Chủ hộ</option>
                                </select>
                                <input 
                                    type="text"
                                    placeholder="Nhập thông tin tra cứu..."
                                    className="search-form__input3"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="button button--primary3">
                                    Truy xuất
                                </button>
                            </form>
                        </section>

                        {/* Section 2: Members List */}
                        <section className="card card--list3">

                            <h2 className="card__title3">II. Danh sách nhân khẩu hiện tại</h2>
                            {householdMembers.length > 0 ? (
                                <div className="table-wrapper3">
                                    <table className="data-table3">
                                        <thead>
                                            <tr className="data-table__row data-table__row--head3">
                                                <th className="data-table__th3">Họ tên</th>
                                                <th className="data-table__th3">CCCD</th>
                                                <th className="data-table__th3">Quan hệ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {householdMembers.map(m => (
                                                <tr key={m.Ma_CCCD} className="data-table__row data-table__row--body3">
                                                    <td className="data-table__td data-table__td--name3">{m.Ho_Ten}</td>
                                                    <td className="data-table__td3">{m.Ma_CCCD}</td>
                                                    <td className="data-table__td3">
                                                        <span className={`badge3 ${m.Quan_He === 'Chủ hộ' ? 'badge--danger' : 'badge--neutral'}`}>
                                                            {m.Quan_He}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state3">
                                    <p>Chưa có dữ liệu hộ khẩu.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="move-page__sidebar3">
                        {/* Section 3: Submit Form */}
                        <section className="card card--sticky3">
                            <h2 className="card__title3">
                                III. Thông tin chuyển đi
                            </h2>

                            {success && <div className="alert alert--success3">{message}</div>}
                            {error && <div className="alert alert--error3">{error}</div>}

                            <form onSubmit={handleSubmit} className="entry-form3">
                                <div className="entry-form__group3">
                                    <label className="entry-form__label3">Mã hộ khẩu xác nhận</label>
                                    <input 
                                        type="text" 
                                        name="maHK"
                                        readOnly 
                                        className="entry-form__input3 entry-form__input--readonly3"
                                        value={formData.maHK}
                                    />
                                </div>

                                <div className="entry-form__group3">
                                    <label className="entry-form__label3">Ngày chuyển đi</label>
                                    <input 
                                        type="date" 
                                        name="ngayChuyen"
                                        required
                                        className="entry-form__input3"
                                        value={formData.ngayChuyen}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="entry-form__group3">
                                    <label className="entry-form__label3">Nơi đến (Địa chỉ mới)</label>
                                    <textarea 
                                        name="noiDen"
                                        required
                                        placeholder="Xã/Phường, Quận/Huyện, Tỉnh..."
                                        className="entry-form__textarea3"
                                        value={formData.noiDen}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="entry-form__group3">
                                    <label className="entry-form__label3">Lý do chuyển đi</label>
                                    <input 
                                        type="text" 
                                        name="lyDo"
                                        placeholder="VD: Thay đổi chỗ ở..."
                                        className="entry-form__input3"
                                        value={formData.lyDo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading || !formData.maHK}
                                    className={`button button--large3 ${loading || !formData.maHK ? 'button--disabled' : 'button--danger'}`}
                                >
                                    {loading ? 'Đang xử lý...' : 'XÁC NHẬN CHUYỂN ĐI'}
                                </button>
                                
                                <p className="entry-form__note3">
                                    Lưu ý: Hành động này sẽ vô hiệu hóa hộ khẩu hiện tại và cập nhật trạng thái "Chuyển đi" cho tất cả thành viên.
                                </p>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveEntireHouseholdPage;