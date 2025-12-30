import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardStats } from './redux/qlnhankhau'; 
import { 
    FaUsers, 
    FaHome, 
    FaUserClock, 
    FaUserSlash, 
    FaChild 
} from 'react-icons/fa';
import './styles/Home.css';

function Main() {
    const dispatch = useDispatch();
    
    const { dashboardStats, loading } = useSelector((state) => state.qlnhankhau);

    useEffect(() => {
        dispatch(getDashboardStats());
    }, [dispatch]);

    const stats = [
        { 
            label: "TỔNG DÂN SỐ", 
            value: dashboardStats?.totalPopulation||0, 
            icon: <FaUsers />, 
            color: "#3b82f6"
        },
        { 
            label: "HỘ KHẨU", 
            value: dashboardStats?.totalHoKhau||0, 
            icon: <FaHome />,
            color: "#10b981" 
        },
        { 
            label: "TẠM TRÚ", 
            value: dashboardStats?.totalTamTru||0, 
            icon: <FaUserClock />,
            color: "#f59e0b" 
        },
        { 
            label: "TẠM VẮNG", 
            value: dashboardStats?.totalTamVang||0, 
            icon: <FaUserSlash />,
            color: "#ef4444" 
        },
       
    ];

    if (loading) {
        return <div className="loading">Đang tải dữ liệu thống kê...</div>;
    }

    return (
        <div className="main-wrapper">
            <div className="main-header-section">
                <h1 className="main-title">Hệ Thống Quản Lý Dân Cư</h1>
                <p className="main-subtitle">Nền tảng quản lý hành chính địa phương thông minh và hiệu quả!</p>
            </div>

            <div className="stats-container">
                {stats.map((item, index) => (
                    <div key={index} className="stat-card-item">
                        <div className="stat-icon-box" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                            {item.icon}
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{item.value.toLocaleString()}</span>
                            <span className="stat-label">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Main;