import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPhanAnhStatistics } from '../redux/phananh';

const PhanAnhStats = () => {
    const dispatch = useDispatch();
    const { statistics, status } = useSelector((state) => state.phanAnh);

    useEffect(() => {
        dispatch(fetchPhanAnhStatistics());
    }, [dispatch]);

    if (status === 'loading') return <div className="loading-text">Đang tải dữ liệu...</div>;

    return (
        <div className="stats-dashboard-container">
            <h2 className="stats-title">BÁO CÁO THỐNG KÊ KIẾN NGHỊ</h2>
            
            <div className="stats-grid">
                <div className="stat-card card-total">
                    <div className="stat-content">
                        <span className="stat-label">Tổng số phản ánh: </span>
                        <span className="stat-value">{statistics.TongSo}</span>
                    </div>
                </div>

                <div className="stat-card card-pending">
                    <div className="stat-content">
                        <span className="stat-label">Chưa tiếp nhận: </span>
                        <span className="stat-value">{statistics.ChuaTiepNhan}</span>
                    </div>
                </div>

                <div className="stat-card card-processing">
                    <div className="stat-content">
                        <span className="stat-label">Đã tiếp nhận: </span>
                        <span className="stat-value">{statistics.DaTiepNhan}</span>
                    </div>
                </div>

                <div className="stat-card card-resolved">
                    <div className="stat-content">
                        <span className="stat-label">Đã xử lý xong: </span>
                        <span className="stat-value">{statistics.DaXuLy}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhanAnhStats;