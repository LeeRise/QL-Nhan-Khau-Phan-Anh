import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePhanAnhStatus } from '../redux/phananh';
import SearchFilter from './search';
import '../styles/phanhoi.css'
const AdminResponsePage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.authUser);
    const { summaryList } = useSelector(state => state.phanAnh);
    const [selectedPA, setSelectedPA] = useState(null);
    const [noiDungPH, setNoiDungPH] = useState('');
    const [trangThaiMoi, setTrangThaiMoi] = useState('Đã tiếp nhận');

    const handleUpdate = async (maPA) => {
        if (trangThaiMoi === 'Đã xử lý' && !noiDungPH.trim()) {
            alert("Vui lòng nhập nội dung phản hồi xử lý!");
            return;
        }

        const data = {
            maPA,
            trangThai: trangThaiMoi,
            noiDung: trangThaiMoi === 'Đã xử lý' ? noiDungPH : null,
            maCCCD_CB:  user.Ma_CCCD
        };

        try {
            await dispatch(updatePhanAnhStatus(data));
            alert("Cập nhật thành công!");
            setSelectedPA(null);
            setNoiDungPH('');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-container">
            <h2>Quản lý & Xử lý Phản ánh</h2>
            <SearchFilter />

            <div className="list-container9">
                {summaryList.map(pa => (
                    <div key={pa.Ma_PA} className="pa-card" >
                        <div >
                            <h4>{pa.Tieu_De}</h4>
                            <span className={`badge status-${pa.Trang_Thai}`}>{pa.Trang_Thai}</span>
                        </div>
                        <p>Người gửi: <b>{pa.Nguoi_Gui}</b> - Ngày: {new Date(pa.Ngay_PA).toLocaleDateString('vi-VN')}</p>
                        
                        <button onClick={() => setSelectedPA(selectedPA?.Ma_PA === pa.Ma_PA ? null : pa)}>
                            {selectedPA?.Ma_PA === pa.Ma_PA ? "Đóng chi tiết" : "Xem nội dung & Xử lý"}
                        </button>

                        {selectedPA?.Ma_PA === pa.Ma_PA && (
                            <div className="pa-detail-expanded" >
                                <h5>Nội dung phản ánh:</h5>
                                <p >
                                    {pa.ND_PA}
                                </p>

                                <h5>Minh chứng đính kèm:</h5>
                                <div>
                                    {pa.Files && pa.Files.length > 0 ? pa.Files.map((file, index) => (
                                        <div key={index}>
                                            {file.Loai_File === 'image' ? (
                                                <img src={file.URL_File} alt="Evidence" />
                                            ) : (
                                                <video src={file.URL_File} controls  />
                                            )}
                                        </div>
                                    )) : <p><i>Không có file đính kèm</i></p>}
                                </div>

                                <hr />
                                <div className="response-form">
                                    <label><b>Cập nhật trạng thái:</b></label>
                                    <select value={trangThaiMoi} onChange={(e) => setTrangThaiMoi(e.target.value)} >
                                        <option value="Đã tiếp nhận">Tiếp nhận</option>
                                        <option value="Đã xử lý">Đã xử lý xong</option>
                                    </select>

                                    {trangThaiMoi === 'Đã xử lý' && (
                                        <textarea 
                                            placeholder="Nhập phản hồi kết quả cho người dân..."
                                            value={noiDungPH}
                                            onChange={(e) => setNoiDungPH(e.target.value)}
                                        />
                                    )}
                                    <div >
                                        <button onClick={() => handleUpdate(pa.Ma_PA)} >Xác nhận</button>
                                        <button onClick={() => setSelectedPA(null)}>Hủy</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminResponsePage;