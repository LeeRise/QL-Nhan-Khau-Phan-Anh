import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerNewHousehold ,checkMemberByCCCD, resetStatus } from '../redux/qlNhanKhau';
import '../styles/dangkiKhau.css'
const RegisterHousehold = () => {
    const dispatch = useDispatch();
    const { loading, error, isCheckingCCCD } = useSelector(state => state.qlnhankhau);

    const initialHousehold = {
        diaChi: '',
        cccdChuHo: '',
        ngayLap: new Date().toISOString().split('T')[0]
    };

    const initialFormState = {
        cccd: '', hoTen: '', biDanh: '', ngaySinh: '', gioiTinh: 'Nam',
        ngayCap: '', noiCap: '', danToc: 'Kinh', queQuan: '', noiSinh: '',
        ngheNghiep: '', noiLamViec: '', dcTT: '', dcThuongTruTruoc: '',
        ttHonNhan: 'Độc thân', email: '', quanHe: '', ngayDKThuongTru: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [household, setHousehold] = useState(initialHousehold);
    const [members, setMembers] = useState([{ ...initialFormState, quanHe: 'Chủ hộ' }]);

 
    const handleHouseholdChange = (e) => {
        const { name, value } = e.target;
        setHousehold(prev => ({ ...prev, [name]: value }));

        if (name === 'cccdChuHo') {
            const newMembers = [...members];
            newMembers[0].cccd = value;
            setMembers(newMembers);
        }

        if (name === 'diaChi') {
            setMembers(prevMembers => 
                prevMembers.map(member => ({
                    ...member,
                    dcTT: value 
                }))
            );
        }
    };

    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const newMembers = [...members];
        newMembers[index][name] = value;

        if (index === 0) {
            if (name === 'cccd') setHousehold(prev => ({ ...prev, cccdChuHo: value }));
            if (name === 'dcTT') {
                setHousehold(prev => ({ ...prev, diaChi: value }));
                setMembers(newMembers.map(m => ({ ...m, dcTT: value })));    
                return;    
            }
        }
        setMembers(newMembers);
    };

    const addMemberField = () => {
        setMembers([...members, { 
            ...initialFormState, 
            dcTT: household.diaChi, 
            quanHe: 'Thành viên',
            ngayDKThuongTru: household.ngayLap 
        }]);
    };

    const removeMember = (index) => {
        if (index === 0) {
            alert("Không thể xóa chủ hộ!");
            return;
        }
        setMembers(members.filter((_, i) => i !== index));
    };

    const validateData = () => {
        if (household.cccdChuHo.length !== 12 && !household.cccdChuHo.startsWith('TE')) {
            alert("Số CCCD chủ hộ phải đủ 12 chữ số!");
            return false;
        }
        if (household.cccdChuHo !== members[0].cccd) {
            alert("Lỗi đồng bộ: CCCD chủ hộ và nhân khẩu số 1 không khớp!");
            return false;
        }
        for (let m of members) {
            if (!m.hoTen || !m.ngaySinh ) {
                alert(`Vui lòng điền đủ Họ tên, Ngày sinh và CCCD cho mọi thành viên!`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (validateData()) {
            try {
                await dispatch(registerNewHousehold({ ...household, members })).unwrap();
                setHousehold(initialHousehold);
            setMembers([{ ...initialFormState, quanHe: 'Chủ hộ' }]);
            dispatch(resetStatus());
          
            }
            catch (err) {
                console.error("Lỗi đăng ký:", err);
            }
        }
    };

    const handleManualCheckCCCD = async (index) => {
    const member = members[index];
    let searchParams = {};

    // Trường hợp 1: Ưu tiên Kiểm tra bằng CCCD nếu có nhập
    if (member.cccd && member.cccd.trim() !== '') {
        searchParams = { cccd: member.cccd.trim() };
    } 
    // Trường hợp 2: Kiểm tra bằng bộ ba (Họ tên + Ngày sinh + Quê quán)
    else if (member.hoTen && member.ngaySinh && member.queQuan) {
        searchParams = { 
            hoTen: member.hoTen.trim(), 
            ngaySinh: member.ngaySinh, 
            queQuan: member.queQuan.trim() 
        };
    } else {
        return alert("Vui lòng nhập số CCCD HOẶC nhập đủ (Họ tên, Ngày sinh, Quê quán) để kiểm tra!");
    }

    try {
        // Gửi Object searchParams (đã tương thích với Model và Slice mới)
        const result = await dispatch(checkMemberByCCCD(searchParams)).unwrap();
        
        if (result.exists && result.data) {
            alert(`Tìm thấy dữ liệu của: ${result.data.Ho_Ten}`);
            const oldData = result.data;
            const newMembers = [...members];
            
            newMembers[index] = {
                ...newMembers[index],
                // Cập nhật lại số CCCD nếu trước đó tìm bằng tên mà ra kết quả
                cccd: oldData.Ma_CCCD || newMembers[index].cccd, 
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
            };

            // Nếu là chủ hộ, cập nhật luôn CCCD chủ hộ ở state household
            if (index === 0) {
                setHousehold(prev => ({ ...prev, cccdChuHo: oldData.Ma_CCCD || prev.cccdChuHo }));
            }

            setMembers(newMembers);
        } else {
            alert("Không tìm thấy dữ liệu nhân khẩu này trên hệ thống. Bạn có thể tiếp tục nhập mới.");
        }
    } catch (err) {
        alert(typeof err === 'string' ? err : err.message || "Lỗi kiểm tra");
    }
};
    
   

    return (
        <div className="register-container1">
            <div className="header-box1">
                <h2>Thiết lập Hộ khẩu Mới</h2>
                
            </div>

            {error && (
                <div className="error-message1">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <h3>I. THÔNG TIN HỘ KHẨU</h3>
                    <div>
                        <div className="input-group1">
                            <label>Địa chỉ thường trú của Hộ</label>
                            <input 
                                name="diaChi" value={household.diaChi} onChange={handleHouseholdChange} required placeholder="Số nhà, đường, phường/xã..." />
                        </div>
                        <div className="input-group1">
                            <label>CCCD Chủ hộ (Mã số)</label>
                            <input 
                                name="cccdChuHo" value={household.cccdChuHo} onChange={handleHouseholdChange} required placeholder="12 chữ số" />
                        </div>
                        <div className="input-group1">
                            <label>Ngày lập hộ</label>
                            <input type="date" 
                                name="ngayLap" value={household.ngayLap} onChange={handleHouseholdChange} />
                        </div>
                    </div>
                </div>

                <h3>II. THÔNG TIN CHI TIẾT CÁC THÀNH VIÊN</h3>
                {members.map((member, index) => (
                    <div key={index} className="member-card1">
                        <h4>
                        {index === 0 ? ' CHỦ HỘ' : ` THÀNH VIÊN ${index + 1}:`}
                        <div className='member-controls1'>
                      
                        {index > 0 && (
                            <button type="button" onClick={() => removeMember(index)}>
                                Xóa 
                            </button>
                        )}
                        </div>
                        </h4>
                        
                        <div>
                            <div className="input-group1">
                                <label >
                                    Mã CCCD 
                                </label>
                                <div className="input-conten1">
                                    <input 
                                        name="cccd" 
                                        value={member.cccd} 
                                        onChange={(e) => handleMemberChange(index, e)} 
                                        placeholder="Mã CCCD" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleManualCheckCCCD(index)}
                                        disabled={isCheckingCCCD}
                                    >
                                        {isCheckingCCCD ? '...' : 'KIỂM TRA'}
                                    </button>
                                </div>
                                {isCheckingCCCD && <p className="loading1">Đang truy xuất dữ liệu...</p>}
                            </div>
                            <p>Lưu ý: Có thể để trống CCCD và kiểm tra bằng Họ tên, Ngày sinh, Quê quán! </p>
                            <div className="input-group1">
                                <label>Họ và Tên</label>
                                <input name="hoTen" value={member.hoTen} onChange={(e) => handleMemberChange(index, e)} required />
                            </div>
                            <div className="input-group1">
                                <label>Bi Danh </label>
                                <input name="biDanh" value={member.biDanh} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Ngày sinh</label>
                                <input type="date" name="ngaySinh" value={member.ngaySinh} onChange={(e) => handleMemberChange(index, e)} required />
                            </div>
                            <div className="input-group1">
                                <label>Ngày Cấp CCCD </label>
                                <input type="date" name="ngayCap" value={member.ngayCap} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Nơi cấp CCCD </label>
                                <input name="noiCap" value={member.noiCap} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            
                            <div className="input-group1">
                                <label>Nơi Sinh</label>
                                <input name="noiSinh" value={member.noiSinh} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Giới tính</label>
                                <select name="gioiTinh" value={member.gioiTinh} onChange={(e) => handleMemberChange(index, e)}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="input-group1">
                                <label>Tình Trạng Hôn Nhân</label>
                                <select name="ttHonNhan" value={member.ttHonNhan} onChange={(e) => handleMemberChange(index, e)}>
                                    <option value="Độc thân">Độc thân</option>
                                    <option value="Đã kết hôn">Đã Kết Hôn</option>
                                    <option value="Ly hôn">Ly Hôn</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="input-group1">
                                <label>Dân tộc</label>
                                <input name="danToc" value={member.danToc} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Quan hệ với chủ hộ</label>
                                <input name="quanHe" value={member.quanHe} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Nghề nghiệp</label>
                                <input name="ngheNghiep" value={member.ngheNghiep} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Nơi Làm Việc</label>
                                <input name="noiLamViec" value={member.noiLamViec} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Số điện thoại/Email</label>
                                <input name="email" value={member.email} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Quê quán</label>
                                <input name="queQuan" value={member.queQuan} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Địa chỉ thường trú hiện tại</label>
                                <input name="dcTT" value={member.dcTT} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                            <div className="input-group1">
                                <label>Địa chỉ thường trú Trước </label>
                                <input name="dcThuongTruTruoc" value={member.dcThuongTruTruoc} onChange={(e) => handleMemberChange(index, e)} />
                            </div>
                        </div>
                    </div>
                ))}

                <div>
                    <button type="button" onClick={addMemberField} className='btn-primary1'>
                        + THÊM THÀNH VIÊN
                    </button>
                    <button type="submit" disabled={loading} className='btn-primary1'>
                        {loading ? " ĐANG LƯU DỮ LIỆU..." : "XÁC NHẬN ĐĂNG KÝ HỘ KHẨU"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterHousehold;