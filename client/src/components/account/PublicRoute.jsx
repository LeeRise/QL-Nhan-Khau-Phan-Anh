import { useSelector } from 'react-redux';
import { Navigate,Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const { isAuthenticated } = useSelector((state) => state.authUser);

   return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
    
};

export default PublicRoute;
// nếu quay lại trang đăng nhập khi đăng nhập rồi thì quay lại main