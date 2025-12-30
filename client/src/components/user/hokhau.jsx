import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHouseholdDetails } from '../redux/nhankhau';

const HouseholdProfile = () => {
    const dispatch = useDispatch();
    const { householdData, householdStatus, householdError } = useSelector((state) => state.nhankhauCanhan);

    useEffect(() => {
        dispatch(fetchHouseholdDetails());
    }, [dispatch]);

    if (householdStatus === 'loading') return <div className="Loading-text">Đang tải dữ liệu hộ khẩu...</div>;
    if (householdStatus === 'failed') return <div className="error-message">{householdError}</div>;

    const { info, members } = householdData;

    return (
        <div className="My-Infor-container">
            <div className="Tieude">
                <h2>THÔNG TIN HỘ KHẨU</h2>
                <span className="Tontai">Mã HK: {info?.Ma_HK}</span>
            </div>
            
            <div className="Thong-tin-PA"> 
                <div className="Thong-tin-co-ban"> 
                    <div className="Infor-container">
                        <span className="Infor1">Địa Chỉ Thường Trú</span>
                        <span className="text-md">{info?.Dia_Chi}</span>
                    </div>
                    <div className="Infor-container">
                        <span className="Infor1">Chủ Hộ</span>
                        <span className="text-md 1">{info?.Ten_Chu_Ho}</span>
                        <span className="Infor1" style={{marginTop: '4px'}}>CCCD: {info?.CCCD_Chu_Ho}</span>
                    </div>
                </div>
            </div>

            <div className="Section-Space">
                <h3 className="contentls-1">Thành viên trong gia đình</h3>
                <div className="Phan-bang"> 
                    <table className="bang-1">
                        <thead>
                            <tr>
                                <th>Mã CCCD</th>
                                <th>Họ Tên</th>
                                <th>Quan Hệ Với Chủ Hộ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members && members.length > 0 ? members.map((member) => (
                                <tr key={member.Ma_CCCD}>
                                    <td>{member.Ma_CCCD}</td>
                                    <td className="Highlight-name">{member.Ho_Ten}</td>
                                    <td>
                                        <span className="Trang-thai2">{member.Quan_He}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" style={{textAlign: 'center'}}>Không tìm thấy thành viên</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HouseholdProfile;