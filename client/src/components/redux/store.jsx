
import { combineReducers } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './auth_admin_redux'; 
import adminReducer from './admin_redux'; 
import authReducer from './auth_redux';
import nhankhauReducer from './nhankhau';
import phanAnhReducer from './phananh';
import qlnhankhauSlice from './qlNhanKhau';
import notificationSlice from './noti'
const adminRootReducer = combineReducers({
    adminAuth: adminAuthReducer,
    authUser: authReducer,
    adminData: adminReducer,
    nhankhauCanhan: nhankhauReducer,
    phanAnh: phanAnhReducer,
    qlnhankhau: qlnhankhauSlice,
    noti: notificationSlice
});
const store = configureStore({reducer: adminRootReducer});
export default store;