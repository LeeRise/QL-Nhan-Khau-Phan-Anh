import { Link } from "react-router-dom";
import { FaHome, FaUser, FaClipboardList, FaPlusCircle, FaChartBar, FaFileAlt, FaLock } from 'react-icons/fa';
const getMenuItems = (Ma_VT)=>{
    const baseMenu=[
        {path: '/', name:'Trang chủ',icon: FaHome},
        {path: '/profile', name: 'Thông tin cá nhân', icon: FaUser },
        {path: '/profile1', name: 'Thông tin hộ khẩu', icon: FaUser },
        {path: '/phan-anh/lich-su', name: 'Lịch sử phản ánh ', icon: FaClipboardList },
        {path: '/phan-anh/them-moi', name: 'Thêm phản ánh mới', icon: FaPlusCircle },
    ]
    if(Ma_VT===6){
        return[
            ...baseMenu,
        ]
    }
    if(Ma_VT>=2 && Ma_VT<=3){
        return[...baseMenu,
            { path: '/can-bo/thong-tin-ho-khau', name: 'Thông tin Hộ khẩu chung', icon: FaFileAlt },
            { path: '/can-bo/thay-doi-ho-khau', name: 'Thay đổi thông tin Hộ khẩu', icon: FaLock },
            { path: '/can-bo/thay-doi-phan-anh', name: 'Thay đổi thông tin Phản ánh', icon: FaClipboardList },
            { path: '/can-bo/thong-ke', name: 'Thống kê dân số', icon: FaChartBar },
            { path: '/can-bo/thong-ke-phan-anh', name: 'Thống kê phản ánh', icon: FaChartBar }
        ]
    }
    if(Ma_VT===4){
        return[...baseMenu,
            { path: '/can-bo/thong-tin-ho-khau', name: 'Thông tin Hộ khẩu chung', icon: FaFileAlt },
            { path: '/can-bo/thay-doi-ho-khau', name: 'Thay đổi thông tin Hộ khẩu', icon: FaLock },]
    }
    if(Ma_VT===5){
        return[...baseMenu,
            { path: '/can-bo/thay-doi-phan-anh', name: 'Thay đổi thông tin Phản ánh', icon: FaClipboardList },
            { path: '/can-bo/thong-ke-phan-anh', name: 'Thống kê phản ánh', icon: FaChartBar },]
    }
    if(Ma_VT===1){
        return[
            {path: '/', name:'Trang chủ',icon: FaHome},
            { path: '/admin/cap-quyen', name: 'Quản lý Phân quyền', icon: FaLock },
        ]
    }
    return [];
}
export default function Sidebar({ isOpen, Ma_VT, closeSidebar }) {

    const menuItems = getMenuItems(Ma_VT);
    const sidebarClass = isOpen ? 'sidebar open' : 'sidebar';
    return (
        <nav className={sidebarClass}>
            
            <ul className="sidebar-nav">
                {menuItems.map((item) => (
                    <li key={item.path} >
                        <Link to={item.path} onClick={closeSidebar} className="sidebar-content">
                            <item.icon /> <span>{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );

}