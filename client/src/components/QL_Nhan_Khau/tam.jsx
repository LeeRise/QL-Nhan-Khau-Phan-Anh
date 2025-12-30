import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    registerResidenceChange, 
    checkMemberStatus, 
    resetStatus 
} from '../redux/qlnhankhau';
import { toast } from 'react-toastify';
import '../styles/tam.css'
const ResidenceManagement = () => {
    const dispatch = useDispatch();
    const { loading, success, error, checkedMember, isCheckingCCCD, exists } = useSelector((state) => state.qlnhankhau);

    const [formData, setFormData] = useState({
        loaiHinh: 'Tạm trú', 
        cccd: '',
        hoTen: '',
        ngaySinh: '',
        ngayCap: '',
        noiCap: '',
        gioiTinh: 'Nam',
        email: '',
        queQuan: '',
        noiSinh: '',
        danToc: 'Kinh',
        biDanh: '',
        ttHonNhan: 'Độc thân',
        dcTT: '', 
        dcThuongTruTruoc: '',
        ngheNghiep: '',
        noiLamViec: '',
        tuNgay: '',
        denNgay: '',
        noiDenDi: '', 
        lyDo: '',
        maHK: '', 
        quanHe: ''
    });

    const formatStatus = (status) => {
        if (!status) return "";
        if (status.startsWith("Tạm trú")) return "Tạm trú";
        return status;
    };

    const handleManualCheck = () => {
        const { hoTen, ngaySinh, queQuan, cccd } = formData;
        
        let params = {};
        if (cccd && cccd.length > 0) {
            params = { cccd };
        } else if (hoTen && ngaySinh && queQuan) {
            params = { hoTen, ngaySinh, queQuan };
        } else {
            return toast.warn("Vui lòng nhập CCCD hoặc đủ (Họ tên + Ngày sinh + Quê quán)");
        }
        dispatch(checkMemberStatus(params));
    };

    useEffect(() => {
        if (checkedMember) {
            const currentStatus = checkedMember.Trang_Thai || "";
            if (formData.loaiHinh === 'Tạm trú' ) {
                const isDangThuongTru = currentStatus === "Đang sống";
                const isDangTamTru = currentStatus.startsWith("Tạm trú") && !currentStatus.includes("chuyển đi");
                if (isDangThuongTru || isDangTamTru) {
                toast.error(`Công dân này đang ${isDangThuongTru ? 'thường trú' : 'tạm trú'} tại thôn. Không thể đăng ký Tạm trú mới!`);
                dispatch(resetStatus());
                setFormData(prev => ({ ...prev, cccd: '' }));
                return;
            }
            }
            if (formData.loaiHinh === 'Tạm vắng' && currentStatus !== "Đang sống") {
                toast.warning("Công dân này không phải nhân khẩu thường trú. Vui lòng kiểm tra lại thủ tục Tạm vắng.");
            }
            setFormData(prev => ({
                ...prev,
                hoTen: checkedMember.Ho_Ten || '',
                ngaySinh: checkedMember.Ngay_Sinh ? checkedMember.Ngay_Sinh.split('T')[0] : '',
                gioiTinh: checkedMember.Gioi_Tinh || 'Nam',
                email: checkedMember.Email || '',
                dcTT: checkedMember.DC_TT || '',
                ngayCap: checkedMember.Ngay_Cap_CC  ? checkedMember.Ngay_Cap_CC.split('T')[0] : '',
                noiCap: checkedMember.Noi_Cap || '',
                queQuan: checkedMember.Que_Quan || '',
                noiSinh: checkedMember.Noi_Sinh || '',
                danToc: checkedMember.Dan_Toc || 'Kinh',
                ngheNghiep: checkedMember.Nghe_Nghiep || '',
                noiLamViec: checkedMember.Noi_Lam_Viec || '',
                ttHonNhan: checkedMember.TT_Hon_Nhan || 'Độc thân',
                biDanh: checkedMember.Bi_Danh || '',
            }));
            
            if (checkedMember.Ma_HK) {
                toast.info(`Nhân khẩu đang thuộc hộ khẩu mã số: ${checkedMember.Ma_HK}. Hệ thống đã lấy thông tin.`);
            } else {
                toast.success("Đã tìm thấy thông tin nhân khẩu tự do.");
            }
        }
    }, [checkedMember]);

    const handleCCCDChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, cccd: val });
        if (val.length === 12) {
            dispatch(checkMemberStatus(val));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerResidenceChange(formData));
    };

    useEffect(() => {
        if (success) {
            toast.success(`Đăng ký ${formData.loaiHinh} thành công!`);
            dispatch(resetStatus());
            setFormData(prev => ({...prev, tuNgay: '', denNgay: '', noiDenDi: '', lyDo: ''}));
        }
        if (error) {
            toast.error(error);
            dispatch(resetStatus());
        }
    }, [success, error, dispatch]);

    return (
        <div className="container-residence-7">
            <h2 className="title-page-7">QUẢN LÝ TẠM TRÚ / TẠM VẮNG</h2>

            <form onSubmit={handleSubmit} className="form-main-7">
                {/* PHẦN ĐỊNH DANH */}
                <div className="section-identity-7">
                    <div className="form-group-7">
                        <label className="label-text-7">Hình thức</label>
                        <select name="loaiHinh" value={formData.loaiHinh} onChange={handleChange} className="select-custom-7">
                            <option value="Tạm trú">Đăng ký Tạm trú</option>
                            <option value="Tạm vắng">Khai báo Tạm vắng</option>
                            
                        </select>
                    </div>
                    <div className="form-group-7">
                        <label className="label-text-7">Mã CCCD </label>
                        <div className="input-with-button-7">
                            <input
                                type="text" name="cccd" maxLength="12"
                                value={formData.cccd} onChange={handleCCCDChange}
                                className={`input-custom-7 ${isCheckingCCCD ? 'checking-7' : ''}`}
                                placeholder="Nhập 12 số CCCD..."
                            />
                            <button
                                type="button"
                                onClick={handleManualCheck}
                                disabled={isCheckingCCCD}
                                className="btn-check-7"
                            >
                                {isCheckingCCCD ? '...' : 'KIỂM TRA'}
                            </button>
                            
                        </div>
                        <p>Lưu ý: Có thể sử dụng thông tin Họ và tên, Ngày sinh, Quê quán thay cho tra cứu bằng Mã CCCD! </p>
                    </div>
                </div>

                {/* THÔNG TIN NHÂN KHẨU */}
                <div className={`section-info-7 ${exists ? 'exists-7' : 'new-7'}`}>
                    <h3 className="section-subtitle-7">
                        {exists ? " Thông tin nhân khẩu (Đã có trên hệ thống)" : "I.Thông tin nhân khẩu (Kê khai mới)"}
                    </h3>
                    
                    <div className="grid-layout-7">
                        <div className="col-span-2-7">
                            <label className="label-small-7">Họ và tên</label>
                            <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} 
                                   className="input-custom-7" required />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Số ĐT/Email </label>
                            <input type="text" name="email" value={formData.email} onChange={handleChange} 
                                   className="input-custom-7" required />
                        </div>
                        <div>
                            <label className="label-small-7">Ngày sinh</label>
                            <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} 
                                   className="input-custom-7" required />
                        </div>
                        <div>
                            <label className="label-small-7">Ngày Cấp CCCD</label>
                            <input type="date" name="ngayCap" value={formData.ngayCap} onChange={handleChange} 
                                   className="input-custom-7" />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Nơi cấp CCCD </label>
                            <input type="text" name="noiCap" value={formData.noiCap} onChange={handleChange} 
                                   className="input-custom-7" />
                        </div>
                        <div>
                            <label className="label-small-7">Giới tính</label>
                            <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} className="select-custom-7">
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Dân Tộc </label>
                            <input type="text" name="danToc" value={formData.danToc} onChange={handleChange} 
                                   className="input-custom-7" />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Địa chỉ Thường Trú </label>
                            <input type="text" name="dcTT" value={formData.dcTT} onChange={handleChange} 
                                   className="input-custom-7" />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Tình Trạng Hôn Nhân</label>
                            <select name="ttHonNhan" value={formData.ttHonNhan} onChange={handleChange} className="select-custom-7">
                                <option value="Độc thân">Độc Thân</option>
                                <option value="Đã kết hôn">Đã Kết Hôn</option>
                                <option value="Ly hôn">Ly Hôn</option>
                            </select>
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Nghề nghiệp </label>
                            <input type="text" name="ngheNghiep" value={formData.ngheNghiep} onChange={handleChange} 
                                   className="input-custom-7" required />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Nơi Làm Việc </label>
                            <input type="text" name="noiLamViec" value={formData.noiLamViec} onChange={handleChange} 
                                   className="input-custom-7" required />
                        </div>
                        <div className="col-span-2-7">
                            <label className="label-small-7">Quê Quán </label>
                            <input type="text" name="queQuan" value={formData.queQuan} onChange={handleChange} 
                                   disabled={exists} className="input-custom-7" required />
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN BIẾN ĐỘNG */}
                <div className="section-dynamic-7">
                    <h3 className="section-subtitle-dynamic-7">II. Chi tiết đăng ký cư trú:</h3>
                    <div className="grid-layout-7">
                        <div>
                            <label className="label-bold-7">Từ ngày</label>
                            <input type="date" name="tuNgay" value={formData.tuNgay} onChange={handleChange} className="input-blue-7" required />
                        </div>
                        <div>
                            <label className="label-bold-7">Đến ngày</label>
                            <input type="date" name="denNgay" value={formData.denNgay} onChange={handleChange} className="input-blue-7" required />
                        </div>
                        {formData.loaiHinh === 'Tạm trú' && (
                            <div className="col-span-full-7">
                                <label className="label-orange-7">Mã Hộ Khẩu Tạm Trú (Nếu nhập vào hộ đang có sẵn)</label>
                                <input type="number" name="maHK" value={formData.maHK} onChange={handleChange} className="input-orange-7" placeholder="Nhập mã hộ khẩu nếu ở ghép..." />
                            </div>
                        )}
                        <div className="col-span-full-7">
                            <label className="label-bold-7">Địa chỉ mới {formData.loaiHinh === 'Tạm trú' ? ' (Tạm trú)' : ' (Tạm vắng)'}</label>
                            <input type="text" name="noiDenDi" value={formData.noiDenDi} onChange={handleChange} className="input-blue-7" placeholder="Số nhà, đường, phường/xã..." required />
                        </div>
                        <div className="col-span-full-7">
                            <label className="label-small-7">Quan hệ </label>
                            <input type="text" name="quanHe" value={formData.quanHe} onChange={handleChange} className="input-custom-7"  />
                        </div>
                        
                        <div className="col-span-full-7">
                            <label className="label-bold-7">Lý do</label>
                            <textarea name="lyDo" value={formData.lyDo} onChange={handleChange} className="textarea-blue-7" rows="2" placeholder="Ví dụ: Đi làm, đi học..."></textarea>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`btn-submit-7 ${loading ? 'btn-loading-7' : ''}`}
                >
                    {loading ? 'ĐANG XỬ LÝ...' : `XÁC NHẬN ĐĂNG KÝ ${formData.loaiHinh.toUpperCase()}`}
                </button>
            </form>
        </div>
    );
};

export default ResidenceManagement;