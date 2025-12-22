import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { token, role: userRole, loading } = useAuth();

  console.log('PrivateRoute check:', { 
    hasToken: !!token, 
    userRole, 
    requiredRole: role,
    loading 
  });

  // Đợi load xong từ localStorage
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    console.log('PrivateRoute: No token, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Nếu yêu cầu SuperAdmin
  if (role === "SuperAdmin") {
    if (userRole !== "SuperAdmin") {
      console.log('PrivateRoute: Not SuperAdmin, redirecting to /user');
      return <Navigate to="/user" />;
    }
  }
  
  // Nếu yêu cầu User (bất kỳ role nào không phải SuperAdmin)
  if (role === "User") {
    if (userRole === "SuperAdmin") {
      console.log('PrivateRoute: Is SuperAdmin, redirecting to /admin');
      return <Navigate to="/admin" />;
    }
  }

  console.log('PrivateRoute: Access granted');
  return children;
}
