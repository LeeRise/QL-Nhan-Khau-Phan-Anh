import { Link, useLocation,Outlet } from 'react-router-dom'
import image from '../assets/main1.svg'
import './styles/header.css'
import { useNavigate } from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import { logoutUser,fetchUserSession } from './redux/auth_admin_redux';
import { useEffect,useState, useRef } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt, FaLock, FaUser, FaTimes } from 'react-icons/fa';
import Sidebar from './sidebar';
import './styles/header.css'
export default function Header1(){
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.adminAuth?.isAuthenticated);
    const user = useSelector(state => state.adminAuth?.user);
    const status = useSelector(state => state.adminAuth?.status);
    const sessionChecked = useSelector(state => state.adminAuth?.sessionChecked);
    const Ma_VT = user?.Ma_VT;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(()=>{
        if(!sessionChecked && status === 'idle'){
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
    const location = useLocation();
    const isMain = location.pathname==='/';

    const handleLogout = async () => {
        
        try {
        setIsUserMenuOpen(false);
        await dispatch(logoutUser()).unwrap(); 
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        initialOpenRef.current = false;
        window.location.replace('/admin/login');
    }
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
                        <FaBars  />
                    </button>
                )}
                
                <div className='logo-h'><img src={image}/></div>
                

                <div className="header-auth-section" ref={userMenuRef}>
                    {isAuthenticated ? (
                        <>
                        <div className='user-menu-wrapper'>
                            <button className="user-icon-btn" onClick={toggleUserMenu}>
                                <FaUserCircle size={30} /> 
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown-menu">
                                    
                                    <div className="menu-item logout-btn" onClick={handleLogout}>
                                        <FaSignOutAlt style={{marginRight: '10px'}}/> Đăng Xuất
                                    </div>
                                </div>
                            )}
                        </div>
                        </>
                    ) : (
                        isMain && (
                            <Link to="/login" className="header-login">Đăng Nhập</Link>
                        )
                    )}
                </div>
            </header>
            
            <div className="app-body">
                {isAuthenticated && user && isSidebarOpen && (
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