import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMember, getHouseholdMembers, resetStatus, checkMemberByCCCD } from '../redux/qlNhanKhau';
import { useNavigate } from 'react-router-dom';
import '../styles/themTv.css'
const initialFormState = {
    maHK: '',
    maCCCD: '',
    hoTen: '',
    ngaySinh: '',
    ngayCap: '',
    noiCap: '',
    dcTT: '',
    gioiTinh: 'Nam',
    email: '',
    queQuan: '',
    noiSinh: '',
    ttHonNhan: 'Độc thân',
    biDanh: '',
    ngheNghiep: '',
    danToc: 'Kinh',
    ngayDK: new Date().toISOString().split('T')[0],
    dcThuongTruTruoc: '',
    noiLamViec: '',
    quanHe: '',
    ghiChu: ''
};

const AddMemberPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success, message, isCheckingCCCD } = useSelector((state) => state.qlnhankhau);

    const [searchType, setSearchType] = useState('MaHK');
    const [searchTerm, setSearchTerm] = useState('');
    const [isHouseholdFound, setIsHouseholdFound] = useState(false);
    const [formData, setFormData] = useState(initialFormState);

    const resetAll = () => {
        setFormData(initialFormState);
        setSearchTerm('');
        setIsHouseholdFound(false);
        dispatch(resetStatus());
    };

    

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return alert("Vui lòng nhập nội dung tra cứu");

        setIsHouseholdFound(false);
        const filters = {
            [searchType === 'MaHK' ? 'maHK' : searchType === 'CCCD' ? 'cccdChuHo' : 'HoTen']: searchTerm
        };

        const result = await dispatch(getHouseholdMembers(filters));

        if (result.payload && Array.isArray(result.payload) && result.payload.length > 0) {
            const firstMember = result.payload[0];
            setIsHouseholdFound(true);
            setFormData(prev => ({
                ...prev,
                maHK: firstMember.Ma_HK,
                dcTT: firstMember.DC_TT || ''
            }));
        } else {
            setIsHouseholdFound(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addMember(formData));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (success && message?.includes("Thêm")) {
            dispatch(resetStatus());
            resetAll();
        }
    }, [success, message, dispatch]);

    const handleManualCheckCCCD = async () => {
        let searchParams = {};
        if (formData.maCCCD && formData.maCCCD.trim() !== '') {
            searchParams = { cccd: formData.maCCCD.trim() };
        } else if (formData.hoTen && formData.ngaySinh && formData.queQuan) {
            searchParams = {
                hoTen: formData.hoTen.trim(),
                ngaySinh: formData.ngaySinh,
                queQuan: formData.queQuan.trim()
            };
        } else {
            return alert("Vui lòng nhập Mã định danh HOẶC đủ bộ (Họ tên, Ngày sinh, Quê quán) để kiểm tra!");
        }

        try {
            const result = await dispatch(checkMemberByCCCD(searchParams)).unwrap();
            if (result.exists && result.data) {
                alert(`Tìm thấy dữ liệu của: ${result.data.Ho_Ten}.`);
                const oldData = result.data;
                setFormData(prev => ({
                    ...prev,
                    maCCCD: oldData.Ma_CCCD || prev.maCCCD,
                    hoTen: oldData.Ho_Ten || '',
                    biDanh: oldData.Bi_Danh || '',
                    ngaySinh: oldData.Ngay_Sinh ? oldData.Ngay_Sinh.split('T')[0] : '',
                    gioiTinh: oldData.Gioi_Tinh || 'Nam',
                    ngayCap: oldData.Ngay_Cap_CC ? oldData.Ngay_Cap_CC.split('T')[0] : '',
                    noiCap: oldData.Noi_Cap || '',
                    queQuan: oldData.Que_Quan || '',
                    noiSinh: oldData.Noi_Sinh || '',
                    danToc: oldData.Dan_Toc || '',
                    dcThuongTruTruoc: oldData.DC_TT || '',
                    email: oldData.Email || '',
                    ngheNghiep: oldData.Nghe_Nghiep || '',
                    noiLamViec: oldData.Noi_Lam_Viec || '',
                    ttHonNhan: oldData.TT_Hon_Nhan || 'Độc thân',
                }));
            } else {
                alert("Đây là nhân khẩu mới hoàn toàn hoặc thông tin không khớp.");
            }
        } catch (err) {
            alert(err.message || "Lỗi tra cứu");
        }
    };

    return (
        <div className="page-wrapper4 add-member-page4">
            <h2 className="page-title4">
                THÊM NHÂN KHẨU MỚI VÀO HỘ
            </h2>

            {/* PHẦN 1: TRA CỨU */}
            <section className="search-section4">
                <label className="section-label4">Truy xuất thông tin hộ khẩu</label>
                <form onSubmit={handleSearch} className="search-box4">
                    <select 
                        className="search-select4"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        disabled={isHouseholdFound}
                    >
                        <option value="MaHK">Mã hộ khẩu</option>
                        <option value="CCCD">CCCD Chủ hộ</option>
                        <option value="HoTen">Tên Chủ hộ</option>
                    </select>
                    <input 
                        type="text"
                        placeholder="Nhập thông tin tra cứu..."
                        className="search-input4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isHouseholdFound}
                    />
                    {!isHouseholdFound ? (
                        <button type="submit" className="btn-search4">Truy xuất</button>
                    ) : (
                        <button type="button" onClick={() => {setIsHouseholdFound(false); setSearchTerm('');}} className="btn-reset4">Hủy & Tìm lại</button>
                    )}
                </form>
            </section>

            {/* PHẦN 2: FORM NHẬP LIỆU */}
            {isHouseholdFound && (
                <form onSubmit={handleSubmit} className="member-form4">
                    <div className="form-grid4">
                        
                        {/* Cột 1 */}
                        <div className="form-column4 column-id4">
                            <h4 className="column-title4 title-id4">I. ĐỊNH DANH</h4>
                            <div className="input-group4">
                                <label>Mã hộ khẩu (Auto)</label>
                                <input name="maHK" value={formData.maHK} readOnly className="input-readonly4" />
                            </div>
                            <div className="input-group4">
                                <label>Số CCCD / Mã TE *</label>
                                <div className="flex-row4">
                                    <input name="maCCCD" value={formData.maCCCD} onChange={handleChange} className="input-main4" placeholder="12 số hoặc mã trẻ em" />
                                    <button type="button" onClick={handleManualCheckCCCD} className="btn-check4">KIỂM TRA</button>
                                </div>
                                {isCheckingCCCD && <span className="loading-text4">Đang truy xuất...</span>}
                                <p>Lưu ý: Có thể check bằng cách điền Họ và tên & Quê quán & Ngày sinh thay cho Mã CCCD!</p>
                            </div>
                            <div className="input-group4">
                                <label>Họ và tên *</label>
                                <input name="hoTen" value={formData.hoTen} required onChange={handleChange} className="input-main4" />
                            </div>
                            <div className="input-group4">
                                <label>Bí danh</label>
                                <input name="biDanh" value={formData.biDanh} onChange={handleChange} className="input-main4" />
                            </div>
                            <div className="input-group4">
                                <label>Số Điện thoại/ Email </label>
                                <input name="email" value={formData.email} required onChange={handleChange} className="input-main4" />
                            </div>
                            <div className="input-group4">
                                <label>Dân tộc </label>
                                <input name="danToc" value={formData.danToc}  onChange={handleChange} className="input-main4" />
                            </div>
                            <div className="input-group-row4">
                                <div className="input-sub4">
                                    <label>Ngày sinh *</label>
                                    <input type="date" name="ngaySinh" value={formData.ngaySinh} required onChange={handleChange} />
                                </div>
                                <div className="input-sub4">
                                    <label>Giới tính</label>
                                    <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group4">
                                <label>Nơi cấp CCCD</label>
                                <input name="noiCap" value={formData.noiCap}  onChange={handleChange} className="input-main4" />
                            </div>
                            <div className="input-sub4">
                                    <label>Ngày cấp CCCD</label>
                                    <input type="date" name="ngayCap" value={formData.ngayCap}  onChange={handleChange} />
                                </div>
                            
                        </div>

                        {/* Cột 2 */}
                        <div className="form-column4 column-residence4">
                            <h4 className="column-title4 title-residence4">II. CƯ TRÚ & QUAN HỆ</h4>
                            <div className="input-group4">
                                <label>Quan hệ với chủ hộ *</label>
                                <input name="quanHe" value={formData.quanHe} required placeholder="VD: Con, Vợ..." onChange={handleChange} />
                            </div>
                            <div className="input-group4 highlight4">
                                <label>Địa chỉ thường trú *</label>
                                <input name="dcTT" value={formData.dcTT} required onChange={handleChange} className="input-highlight" />
                            </div>
                            <div className="input-group4 ">
                                <label>Địa chỉ thường trú trước</label>
                                <input name="dcThuongTruTruoc" value={formData.dcThuongTruTruoc}  onChange={handleChange}  />
                            </div>
                            <div className="input-group4">
                                <label>Quê Quán</label>
                                <input name="queQuan" value={formData.queQuan} onChange={handleChange} />
                            </div>
                            <div className="input-group4">
                                <label>Nơi Sinh</label>
                                <input name="noiSinh" value={formData.noiSinh} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Cột 3 */}
                        <div className="form-column4 column-other4">
                            <h4 className="column-title4 title-other4">III. KHÁC</h4>
                            <div className="input-group4">
                                <label>Nghề nghiệp</label>
                                <input name="ngheNghiep" value={formData.ngheNghiep} onChange={handleChange} />
                            </div>
                            <div className="input-group4">
                                <label>Nơi làm việc</label>
                                <input name="noiLamViec" value={formData.noiLamViec} onChange={handleChange} />
                            </div>
                            <div className="input-group4">
                                <label>Hôn nhân</label>
                                <select name="ttHonNhan" value={formData.ttHonNhan} onChange={handleChange}>
                                    <option value="Độc thân">Độc thân</option>
                                    <option value="Đã kết hôn">Đã kết hôn</option>
                                    <option value="Ly hôn">Ly hôn</option>
                                </select>
                            </div>
                            <div className="input-group4">
                                <label>Ghi chú biến động</label>
                                <textarea name="ghiChu" value={formData.ghiChu} onChange={handleChange} rows="3" placeholder="Lý do thêm mới..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer4">
                        <button type="submit" disabled={loading} className="btn-submit4">
                            {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN LƯU NHÂN KHẨU'}
                        </button>
                    </div>
                </form>
            )}

            {error && <div className="error-message4">{error}</div>}
        </div>
    );
};

export default AddMemberPage;