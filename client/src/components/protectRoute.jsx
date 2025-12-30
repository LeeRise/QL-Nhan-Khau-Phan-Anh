import { useSelector,useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Navigate, useLocation,Outlet } from 'react-router-dom';
import { hasPermission } from './utils/permissions';
import { fetchUserSession } from './redux/auth_redux';
const ProtectedRouteU = ({ children }) => {
    const { isAuthenticated, user ,sessionChecked} = useSelector(state => state.authUser);
    const location = useLocation();
    const dispatch=useDispatch();
    useEffect(() => {
        dispatch(fetchUserSession());
    }, [dispatch]);
    if(!sessionChecked){
    return null;
    }
    if (!isAuthenticated ) {

        return <Navigate to="/login" replace />;
    }

    const isAllowed = hasPermission(user?.Ma_VT, location.pathname);

    if (!isAllowed) {
        return <Navigate to="/" replace />; }

    return <Outlet/>;
};

export default ProtectedRouteU;

// tránh người dùng vào nhầm trang không có quyền 