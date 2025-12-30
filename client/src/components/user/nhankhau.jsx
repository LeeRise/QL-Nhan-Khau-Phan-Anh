import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPersonalProfile } from '../redux/nhankhau';

const PersonalProfile = () => {
    const dispatch = useDispatch();
    const { personalData, personalStatus, personalError } = useSelector((state) => state.nhankhauCanhan);

    useEffect(() => {
        dispatch(fetchPersonalProfile());
    }, [dispatch]);

    if (personalStatus === 'loading') return <div >Đang tải...</div>;
    if (personalStatus === 'failed') return <div >{personalError}</div>;
    if (!personalData) return <div className='error-message'>Không có dữ liệu.</div>;

    const display = (value) => value || <span className="No-infor">Chưa cập nhật</span>;
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '---';

    return (
        <div className="My-Infor-container">
            <div className="Tieude">
                <h2 >HỒ SƠ NHÂN KHẨU</h2>
                <span className={` ${personalData.Trang_Thai === 'Đang sống' ? 'Tontai' : 'KhongTontai'}`}>
                    {personalData.Trang_Thai} 
                </span>
            </div>

            <div className="Thong-tin">
                <section>
                    <h3 >
                         Thông tin cơ bản
                    </h3>
                    <div className="Thong-tin-co-ban">
                        <InfoItem label="Họ và tên: " value={personalData.Ho_Ten} highlight />
                        <InfoItem label="Bí danh: " value={display(personalData.Bi_Danh)} />
                        <InfoItem label="Ngày sinh: " value={formatDate(personalData.Ngay_Sinh)} />
                        <InfoItem label="Giới tính: " value={personalData.Gioi_Tinh} />
                        <InfoItem label="Nơi sinh: " value={display(personalData.Noi_Sinh)} />
                        <InfoItem label="Quê quán: " value={display(personalData.Que_Quan)} />
                    </div>
                </section>

                <section>
                    <h3 className="Thong-tin">
                         Giấy tờ pháp lý & Liên lạc
                    </h3>
                    <div className="Thong-tin-co-ban">
                        <InfoItem label="Số CCCD: " value={personalData.Ma_CCCD} />
                        <InfoItem label="Ngày cấp: " value={formatDate(personalData.Ngay_Cap_CC)} />
                        <InfoItem label="Nơi cấp: " value={display(personalData.Noi_Cap)} />
                        <InfoItem label="Email: " value={display(personalData.Email)} />
                        <div className="Dia-chi">
                            <InfoItem label="Địa chỉ thường trú: " value={personalData.DC_TT} />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="Thong-tin">
                       Tình trạng & Công việc
                    </h3>
                    <div className="Thong-tin-co-ban">
                        <InfoItem label="Tình trạng hôn nhân: " value={display(personalData.TT_Hon_Nhan)} />
                        <InfoItem label="Nghề nghiệp: " value={display(personalData.Nghe_Nghiep)} />
                        <InfoItem label="Nơi làm việc: " value={display(personalData.Noi_Lam_Viec)} />
                        <InfoItem label="Mã Hộ Khẩu: " value={personalData.Ma_HK || 'Chưa vào hộ'} />
                    </div>
                </section>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, highlight = false }) => (
    <div className="Infor-container">
        <span className="Infor1">{label}</span>
        <span className={`text-md ${highlight ? '1' : '2'}`}>{value}</span>
    </div>
);

export default PersonalProfile;