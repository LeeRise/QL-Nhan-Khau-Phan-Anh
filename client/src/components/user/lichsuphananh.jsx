import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyHistory, fetchPhanAnhDetail, clearCurrentDetail,deletePhanAnh } from '../redux/phananh';

const PhanAnhHistory = () => {
    const dispatch = useDispatch();
    const { myHistory, currentDetail, status } = useSelector((state) => state.phanAnh);
    const { user } = useSelector((state) => state.authUser);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (user?.Ma_CCCD) {
            dispatch(fetchMyHistory(user.Ma_CCCD));
        }
    }, [dispatch, user]);

    const handleViewDetail = (maPA) => {
        dispatch(fetchPhanAnhDetail(maPA));
        setShowModal(true);
    };

    const handleDelete = (maPA) => {
        dispatch(deletePhanAnh(maPA));
    };
    const closeModal = () => {
        setShowModal(false);
        dispatch(clearCurrentDetail());
    };

    const getStatusColor = (trangThai) => {
        switch (trangThai) {
            case 'Chưa Tiếp nhận': return '1';
            case 'Đã tiếp nhận': return '2';
            case 'Đã xử lý': return '3';
            default: return '4';
        }
    };

    return (
        <div className="Phan-anh-History">
            <h2 >Lịch Sử Phản Ánh Của Bạn</h2>
            
            <div className="Phan-bang">
                <table className="bang-1">
                    <thead >
                        <tr>
                            <th >Ngày gửi</th>
                            <th >Tiêu đề</th>
                            <th >Trạng thái</th>
                            <th >Thao tác</th>
                            <th>Xóa </th>
                        </tr>
                    </thead>
                    <tbody >
                        {myHistory.length > 0 ? myHistory.map((item) => (
                            <tr key={item.Ma_PA} >
                                <td >{new Date(item.Ngay_PA).toLocaleDateString('vi-VN')}</td>
                                <td >{item.Tieu_De}</td>
                                <td >
                                    <span className={`Trang-thai${getStatusColor(item.Trang_Thai)}`}>
                                        {item.Trang_Thai}
                                    </span>
                                </td>
                                <td >
                                    <button 
                                        onClick={() => handleViewDetail(item.Ma_PA)}
                                        className="btn-primary"
                                    >
                                        Chi tiết
                                    </button>
                                    </td>
                                <td> {item.Trang_Thai === 'Chưa Tiếp nhận' && (
                                            <button 
                                                onClick={() => handleDelete(item.Ma_PA)}
                                                className="btn-danger"
                                                
                                            >
                                                Xóa
                                            </button>)}</td> 
                                
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400">Bạn chưa gửi phản ánh nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && currentDetail && currentDetail.info && (
                <div className="Chi-tiet-PA">
                    <div className="Chi-Tiet-PA1">
                        <div className="So-PA">
                            <h3 >Phản ánh {currentDetail.info.Ma_PA}:</h3>
                            <button onClick={closeModal} className="Tat">&times;</button>
                        </div>

                        <div className="Thong-tin-PA">
                            <div>
                                <h4 className="contentls-1">Tiêu đề phản ánh</h4>
                                <p className="contentls-2">{currentDetail.info.Tieu_De}</p>
                            </div>

                            <div>
                                <h4 className="contentls-1">Nội dung phản ánh</h4>
                                <p className="contentls-2">{currentDetail.info.ND_PA}</p>
                            </div>

                            
                                <div>
                                    <h4 className="contentls-1">Phân loại</h4>
                                    <p className="contentls-2">{currentDetail.info.Loai_Van_De}</p>
                                </div>
                                <div>
                                    <h4 className="contentls-1">Ngày gửi</h4>
                                    <p className="contentls-2">{new Date(currentDetail.info.Ngay_PA).toLocaleString('vi-VN')}</p>
                                </div>
                            
                            
                            <div>
                                <h4 className="contentls-1">Hình ảnh & Video đính kèm</h4>
                                {currentDetail.files && currentDetail.files.length > 0 ? (
                                    <div className="image1">
                                        {currentDetail.files.map((f, index) => (
                                            <div key={index} className="relative group">
                                                {f.Loai_File === 'image' ? (
                                                    <a href={f.URL_File} target="_blank" rel="noreferrer">
                                                        <img 
                                                            src={f.URL_File} 
                                                            alt="Phản ánh" 
                                                            className="image-PA" 
                                                        />
                                                    </a>
                                                ) : (
                                                    <video 
                                                        src={f.URL_File} 
                                                        controls 
                                                        className="video-PA" 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="No-file">Không có tệp đính kèm.</p>
                                )}
                            </div>

                            <div className="Phan-Hoi">
                                <h4 className="contentls-1">
                                    <span className="contentls-2"></span>
                                    Phản hồi từ Cán bộ xử lý
                                </h4>
                                {currentDetail.replies && currentDetail.replies.length > 0 ? (
                                    currentDetail.replies.map((rep) => (
                                        <div key={rep.Ma_PH} className="PhanHoi-ND">
                                            <p className="contentls-2">{rep.Noi_Dung}</p>
                                            <div className="PhanHoi-Thong tin">
                                                <span>Cán bộ: <strong>{rep.Ten_Can_Bo_XL}</strong></span>
                                                <p>Thời gian:</p>
                                                <span>{new Date(rep.Ngay_PH).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="contentls-2">Hiện tại chưa có phản hồi chính thức từ cán bộ chuyên trách.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhanAnhHistory;