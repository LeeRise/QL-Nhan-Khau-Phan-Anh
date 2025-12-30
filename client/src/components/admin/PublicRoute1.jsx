import { useSelector } from 'react-redux';
import { Navigate,Outlet } from 'react-router-dom';
const PublicRoute1 = () => {
    const { isAuthenticated,user } = useSelector((state) => state.adminAuth);

    console.log(user?.Ma_VT)
    if (isAuthenticated && user?.Ma_VT ===1) {
        return <Navigate to="/admin/cap-quyen" replace />;
    }
    else if (isAuthenticated && user?.Ma_VT !==1) return <Navigate to="/" replace />;
    
    return <Outlet/>;
};

export default PublicRoute1;
// đăng nhập rồi thì chỉ có thể ở cap-quyen