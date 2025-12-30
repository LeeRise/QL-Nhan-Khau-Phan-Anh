import { useSelector,useDispatch } from 'react-redux';
import { Navigate,useLocation,Outlet } from 'react-router-dom';
import { hasPermission } from '../utils/permissions';
import { fetchUserSession } from '../redux/auth_admin_redux';
import { useEffect } from 'react';
const ProtectedRoute = () => {
    const { isAuthenticated,user, sessionChecked,status } = useSelector((state) => state.adminAuth);
    const { isAuthenticated: isUserAuth } = useSelector((state) => state.authUser);

    const dispatch=useDispatch();
        useEffect(() => {
            if (!sessionChecked ) dispatch(fetchUserSession());
        }, [dispatch,sessionChecked]);
    if(!sessionChecked ){
        return null;
        }
    if (!isAuthenticated ) {
        return <Navigate to="/admin/login" replace />;
    }
    
    if(user?.Ma_VT!==1 ){
        return <Navigate to ="/" replace />
    }


    
    return <Outlet />
};

export default ProtectedRoute;
// chưa đăng nhập thì chỉ vào được admin/login