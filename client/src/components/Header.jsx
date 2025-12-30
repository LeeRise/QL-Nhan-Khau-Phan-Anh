import { Link, useLocation } from 'react-router-dom'
import image from '../assets/main1.svg'
import './styles/header.css'
import {useDispatch, useSelector} from 'react-redux'
import { logoutUser,fetchUserSession } from './redux/auth_redux';
import { useEffect,useState, useRef } from 'react';
import { FaBars, FaBell, FaSignOutAlt, FaLock, FaUser, FaTimes } from 'react-icons/fa';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';
import { fetchNotifications,markNotificationRead } from './redux/noti';
export default function Header(){
    const location = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.authUser.isAuthenticated);
    const user = useSelector(state => state.authUser?.user);
    const status = useSelector(state => state.authUser?.status);
    const sessionChecked = useSelector(state => state.authUser?.sessionChecked);
    const Ma_VT = user?.Ma_VT;
    const isForgotPassword = location.pathname === '/forgotPassword';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);


    const notifications = useSelector(state => state.noti.list);
    const unreadCount = useSelector(state => state.noti.unreadCount);

    useEffect(() => {
        if (isAuthenticated && user?.Ma_CCCD) {
            dispatch(fetchNotifications(user.Ma_CCCD));
        
        const interval = setInterval(() => {
            dispatch(fetchNotifications(user.Ma_CCCD));
        }, 60000);
        return () => clearInterval(interval);
    }
    }, [isAuthenticated, user, dispatch]);
    const handleNotificationClick = (id, isRead) => {
        if (!isRead) {
            dispatch(markNotificationRead(id));
        }
    };
    useEffect(()=>{
        if(!sessionChecked && status === 'idle' && !isForgotPassword){
            dispatch(fetchUserSession());
        }
    },[dispatch,sessionChecked,status])

    const initialOpenRef = useRef(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && !initialOpenRef.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setIsSidebarOpen(true);
            initialOpenRef.current = true;
        } 
        if (!isAuthenticated) {
            setIsSidebarOpen(false);
            initialOpenRef.current = false;
        }
    }, [isAuthenticated]);
    const toggleNotiMenu = () => setIsNotiOpen(!isNotiOpen);
   
    const isLogin = location.pathname==='/login';

    const handleLogout = () => {
        dispatch(logoutUser());
        setIsUserMenuOpen(false);
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const closeUserMenu = () => {
        setIsUserMenuOpen(false);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    }
    return(
        
        <div className='main-wrapper'>
            
            <header className='header'>
                {isAuthenticated && (
                    <button className='user-icon-btn' onClick={toggleSidebar}>
                      <FaBars  size={25}/>
                    </button>
                )}
                <Link className='return' to="/">
                <div className='logo-h'><img src={image}/></div>
                </Link>

                <div className="header-auth-section" ref={userMenuRef}>
                    {isAuthenticated ? (
                        <>
                           <div className="notification-wrapper" style={{ position: 'relative', marginRight: '20px' }}>
                                <button className="user-icon-btn" onClick={toggleNotiMenu}>
                                    <FaBell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="noti-badge">{unreadCount}</span>
                                    )}
                                </button>

                                {isNotiOpen && (
                                    <div className="noti-dropdown">
                                        <div className="noti-header">Thông báo mới</div>
                                        <div className="noti-list" >
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div 
                                                        key={n.Ma_TB} 
                                                        className={`noti-item ${!n.Da_Xem ? 'unread' : ''}`}
                                                        onClick={() => handleNotificationClick(n.Ma_TB, n.Da_Xem)}
                                                        
                                                    >
                                                        <div className='noti-Tieude'>
                                                            {n.Tieu_De}
                                                        </div>
                                                        <div className='noti-ND'>
                                                            {n.Noi_Dung}
                                                        </div>
                                                        <div className='noti-PA'>
                                                            {new Date(n.Ngay_Tao).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="noti-empty" >
                                                    Không có thông báo mới
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="user-menu-wrapper">
                            <button className="user-icon-btn" onClick={toggleUserMenu}>
                                <FaUser size={25} /> 
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown-menu">
                                    {user?.Ma_VT !== 1 && (
                                        <>
                                    <Link to="/profile" className="menu-item" onClick={closeUserMenu}>
                                        <FaUser style={{ marginRight: '10px' }}/> Thông tin cá nhân
                                    </Link>
                                    <Link to="/change-password" className="menu-item" onClick={closeUserMenu}>
                                        <FaLock style={{ marginRight: '10px' }}/> Thay đổi mật khẩu
                                    </Link>
                                    </>
                            )}
                                    <div className="menu-item-logout-btn" onClick={handleLogout}>
                                        <FaSignOutAlt style={{ marginRight: '10px' }}/> Đăng Xuất
                                    </div>
                                </div>
                            )} </div>
                        </>
                    ) : (
                        !isLogin && (
                            <Link to="/login" className="header-login">Đăng Nhập</Link>
                        )
                    )} 
                </div>
                
            </header>
            <div className="app-body">
                {isAuthenticated && isSidebarOpen && (
                    <aside className="sidebar-wrapper">
                        <Sidebar 
                            isOpen={isSidebarOpen} 
                            Ma_VT={Ma_VT} 
                            closeSidebar={closeSidebar} 
                        />
                    </aside>
                )}
                <main className='content-main'>
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}