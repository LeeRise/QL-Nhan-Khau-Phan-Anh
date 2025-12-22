import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminNhanKhau from "./pages/admin/AdminNhanKhau";
import AdminHoKhau from "./pages/admin/AdminHoKhau";
import AdminPhanAnh from "./pages/admin/AdminPhanAnh";
import AdminBienDong from "./pages/admin/AdminBienDong";
import UserDashboard from "./pages/user/UserDashboard";
import UserBienDong from "./pages/user/UserBienDong";
import UserPhanAnh from "./pages/user/UserPhanAnh";
import KhaiBaoNhanKhau from "./pages/user/KhaiBaoNhanKhau";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Trang mặc định */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="SuperAdmin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="nhankhau" element={<AdminNhanKhau />} />
          <Route path="hokhau" element={<AdminHoKhau />} />
          <Route path="phananh" element={<AdminPhanAnh />} />
          <Route path="biendong" element={<AdminBienDong />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <PrivateRoute role="User">
              <UserLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="khaibao" element={<KhaiBaoNhanKhau />} />
          <Route path="biendong" element={<UserBienDong />} />
          <Route path="phananh" element={<UserPhanAnh />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
