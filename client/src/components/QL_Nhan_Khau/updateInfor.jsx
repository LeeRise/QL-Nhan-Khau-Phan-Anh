import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHouseholdMembers, updatePersonInfo, resetStatus } from '../redux/qlNhanKhau';
import '../styles/updateInfor.css'
const UpdateMemberPage = () => {
    const dispatch = useDispatch();
    
    const { loading, error, success, message, householdMembers } = useSelector((state) => state.qlnhankhau);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('maHK');
    const [editingMember, setEditingMember] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const filters = { [searchType]: searchTerm };
        dispatch(getHouseholdMembers(filters));
        setEditingMember(null);
    };

    const handleEditClick = (member) => {
        setEditingMember({
            Ma_CCCD: member.Ma_CCCD,
            Ho_Ten: member.Ho_Ten,
            Ngay_Sinh: member.Ngay_Sinh ? member.Ngay_Sinh.split('T')[0] : '',
            Ngay_Cap_CC: member.Ngay_Cap_CC ? member.Ngay_Cap_CC.split('T')[0] : '',
            Noi_Cap: member.Noi_Cap || '',
            DC_TT: member.DC_TT || '',
            Gioi_Tinh: member.Gioi_Tinh || 'Nam',
            Email: member.Email || '',
            Que_Quan: member.Que_Quan || '',
            Noi_Sinh: member.Noi_Sinh || '',
            TT_Hon_Nhan: member.TT_Hon_Nhan || 'Độc thân',
            Bi_Danh: member.Bi_Danh || '',
            Nghe_Nghiep: member.Nghe_Nghiep || '',
            Dan_Toc: member.Dan_Toc || 'Kinh',
            Ngay_DK_Thuong_Tru: member.Ngay_DK_Thuong_Tru ? member.Ngay_DK_Thuong_Tru.split('T')[0] : '',
            DC_Thuong_Tru_Truoc: member.DC_Thuong_Tru_Truoc || '',
            Noi_Lam_Viec: member.Noi_Lam_Viec || ''
        });
    };

    const handleInputChange = (e) => {
        setEditingMember({ ...editingMember, [e.target.name]: e.target.value });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        dispatch(updatePersonInfo(editingMember));
    };

    useEffect(() => {
        if (success) {
            dispatch(resetStatus());
            setEditingMember(null);
            handleSearch({ preventDefault: () => {} }); 
        }
    }, [success, dispatch]);

    return (
        <div className="update-page-container5">
            <h2 className="update-page-title">Cập nhật thông tin thành viên hộ khẩu</h2>

            {/* PHẦN TÌM KIẾM */}
            <div className="search-section5">
                <form onSubmit={handleSearch} className="search-form5">
                    <select 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)}
                        className="search-select5"
                    >
                        <option value="maHK">Mã Hộ Khẩu</option>
                        <option value="cccdChuHo">CCCD Chủ Hộ</option>
                        <option value="HotenChuHo">Tên Chủ Hộ</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Nhập nội dung tìm kiếm..." 
                        className="search-input5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn-search5">
                        Truy xuất danh sách
                    </button>
                </form>
            </div>

            <div className="main-content-grid5">
                {/* BẢNG DANH SÁCH */}
                <div className="table-container5">
                    <h3 className="section-subtitle5">Danh sách thành viên trong hộ</h3>
                    <div className="scrollable-table5">
                        <table className="member-table5">
                            <thead>
                                <tr>
                                    <th>Họ tên</th>
                                    <th>CCCD</th>
                                    <th>Quan hệ</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {householdMembers.map((m) => (
                                    <tr key={m.Ma_CCCD}>
                                        <td className="font-bold5">{m.Ho_Ten}</td>
                                        <td>{m.Ma_CCCD}</td>
                                        <td>{m.Quan_He}</td>
                                        <td className="text-center5">
                                            <button 
                                                onClick={() => handleEditClick(m)}
                                                className="btn-edit-link5"
                                            >
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {householdMembers.length === 0 && <p className="empty-msg5">Chưa có dữ liệu</p>}
                </div>

                {/* FORM CHỈNH SỬA */}
                <div className="form-container5">
                    <h3 className="section-subtitle5">Thông tin chi tiết chỉnh sửa</h3>
                    {editingMember ? (
                        <form onSubmit={handleUpdate} className="edit-form5">
                            <div className="form-gri5d">
                                <div className="form-group5">
                                    <label>Họ và Tên</label>
                                    <input name="Ho_Ten" value={editingMember.Ho_Ten} onChange={handleInputChange} className="input-field5 highlight5" />
                                </div>
                                <div className="form-group5">
                                    <label>Bí Danh</label>
                                    <input name="Bi_Danh" value={editingMember.Bi_Danh} onChange={handleInputChange} className="input-field5 highlight5" />
                                </div>
                                <div className="form-group5">
                                    <label>Số CCCD</label>
                                    <input name="Ma_CCCD" value={editingMember.Ma_CCCD} readOnly className="input-field5 disabled5" />
                                </div>
                                <div className="form-group5">
                                    <label>Nơi Cấp CCCD</label>
                                    <input name="Noi_Cap" value={editingMember.Noi_Cap} className="input-field5 disabled5" />
                                </div>
                                <div className="form-group5">
                                    <label>Ngày Cấp CCCD</label>
                                    <input type="date" name="Ngay_Cap_CC" value={editingMember.Ngay_Cap_CC} onChange={handleInputChange} className="input-field5" />
                                </div>
                                <div className="form-group5">
                                    <label>Ngày Đăng Kí Thường trú</label>
                                    <input type="date" name="Ngay_DK_Thuong_Tru" value={editingMember.Ngay_DK_Thuong_Tru} onChange={handleInputChange} className="input-field5" />
                                </div>
                                <div className="form-group5">
                                    <label>Ngày sinh</label>
                                    <input type="date" name="Ngay_Sinh" value={editingMember.Ngay_Sinh} onChange={handleInputChange} className="input-field5" />
                                </div>
                                <div className="form-group5">
                                    <label>Giới tính</label>
                                    <select name="Gioi_Tinh" value={editingMember.Gioi_Tinh} onChange={handleInputChange} className="input-field5">
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                                <div className="form-group5">
                                    <label>Tình Trạng Hôn Nhân</label>
                                    <select name="TT_Hon_Nhan" value={editingMember.TT_Hon_Nhan} onChange={handleInputChange} className="input-field5">
                                        <option value="Độc thân">Độc Thân</option>
                                        <option value="Đã kết hôn">Đã Kết Hôn</option>
                                        <option value="Ly hôn">Ly Hôn</option>
                                    </select>
                                </div>
                                <div className="form-group5">
                                    <label>Dân tộc</label>
                                    <input name="Dan_Toc" value={editingMember.Dan_Toc} onChange={handleInputChange} className="input-field5" />
                                </div>
                                <div className="form-group5">
                                    <label>Email/SĐT</label>
                                    <input name="Email" value={editingMember.Email} onChange={handleInputChange} className="input-field5" />
                                </div>
                            </div>

                            <div className="form-group-full5">
                                <label>Quê quán</label>
                                <input name="Que_Quan" value={editingMember.Que_Quan} onChange={handleInputChange} className="input-field5" />
                            </div>
                            <div className="form-group-full5">
                                <label>Nơi Sinh</label>
                                <input name="Noi_Sinh" value={editingMember.Noi_Sinh} onChange={handleInputChange} className="input-field5" />
                            </div>
                            <div className="form-group-5">
                                <label>Địa chỉ thường trú</label>
                                <input name="DC_TT" value={editingMember.DC_TT} onChange={handleInputChange} className="input-field5" />
                            </div>
                            <div className="form-group-full5">
                                <label>Địa chỉ thường trú trước</label>
                                <input name="DC_Thuong_Tru_Truoc" value={editingMember.DC_Thuong_Tru_Truoc} onChange={handleInputChange} className="input-field5" />
                            </div>

                            <div className="form-grid5">
                                <div className="form-group5">
                                    <label>Nghề nghiệp</label>
                                    <input name="Nghe_Nghiep" value={editingMember.Nghe_Nghiep} onChange={handleInputChange} className="input-field5" />
                                </div>
                                <div className="form-group5">
                                    <label>Nơi làm việc</label>
                                    <input name="Noi_Lam_Viec" value={editingMember.Noi_Lam_Viec} onChange={handleInputChange} className="input-field5" />
                                </div>
                            </div>

                            <div className="form-actions5">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn-submit5"
                                >
                                    {loading ? "Đang lưu..." : "CẬP NHẬT THAY ĐỔI"}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingMember(null)}
                                    className="btn-cancel5"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="empty-state5">
                            <p>Chọn một thành viên từ bảng bên trái để bắt đầu chỉnh sửa</p>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-mesage5">{error}</div>}
        </div>
    );
};

export default UpdateMemberPage;