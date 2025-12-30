import axios from 'axios'
import {createAsyncThunk} from '@reduxjs/toolkit'
axios.defaults.withCredentials = true;

const AUTH_START = 'AUTH_START';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAIL = 'AUTH_FAIL';
const LOGOUT = 'LOGOUT';
const AUTH_TEMP_TOKEN_UPDATE='AUTH_TEMP_TOKEN_UPDATE'
const AUTH_VALIDATION_ERROR='AUTH_VALIDATION_ERROR';
const FETCH_USER_SESSION_FULFILLED = 'auth/fetchUserSession/fulfilled';
const FETCH_USER_SESSION_REJECTED = 'auth/fetchUserSession/rejected';
const FETCH_USER_SESSION_PENDING = 'auth/fetchUserSession/pending';

const API_URL = 'http://localhost:3000/api/auth';

const initialState = {
    isAuthenticated: false,
    token: null,
    user: null,
    Ma_VT: null,
    status: 'idle',
    error: null,
    sessionChecked: false,
    resetToken: null
};

export const loginUser = (cccd, mat_khau, setLocalStatus, setLocalError)=> async(dispatch)=>{
    dispatch({type: AUTH_START});
    setLocalStatus("loading");
    setLocalError(null);

    try{
        const response = await axios.post(`${API_URL}/login`,{cccd,mat_khau});

        const userData = {
            Ma_VT: response.data.Ma_VT,
            Ma_CCCD: cccd,
        };
        dispatch({
            type: AUTH_SUCCESS,
            payload: {
                user: userData,
            },
        });
        setLocalStatus("success");
    }catch(e){
        const message = e.response?.data?.message||'Đăng nhập không thành công. Hãy kiểm tra lại mạng.';
        dispatch({
            type: AUTH_FAIL,
            payload: message,
        });
        setLocalError({message});
        setLocalStatus("error")
    }
}
export const changePassword = (currentPassword, newPassword,confirmPassword, setLocalStatus, setLocalError)=>async(dispatch)=>{
    dispatch({type: AUTH_START});
    setLocalStatus("loading");
    setLocalError(null);
    try{
        const response = await axios.post(`${API_URL}/change-password`,{currentPassword,newPassword,confirmPassword});
        setLocalStatus("success");
        setLocalError({message: response.data.message || 'Thay đổi mật khẩu thành công.'});
        dispatch({type: LOGOUT});
    
    } catch(e){
        const message = e.response?.data?.message || 'Thay đổi mật khẩu không thành công.'
        dispatch({
            type: AUTH_VALIDATION_ERROR,
            payload: message
        })
        setLocalStatus("error");
        setLocalError(message)
    }
}

export const forgotPassStep1 = (cccd, email, setLocalStatus,setLocalError,callback)=>async(dispatch)=>{
    dispatch({type: AUTH_START});
    setLocalStatus("loading");
    setLocalError(null);
    try{
        const response = await axios.post(`${API_URL}/forgot-password/step1`,{cccd,email});

        dispatch({ type: AUTH_TEMP_TOKEN_UPDATE, payload: response.data.tempToken });
        setLocalStatus("success");
        setLocalError({ message: response.data.message });
        if (callback) callback(response.data);
        
    } catch(e){
        const message = e.response?.data?.message|| 'Không thể xác thực thông tin.'
        dispatch({
            type: AUTH_FAIL,
            payload: message,
        })
        setLocalStatus("error");
        setLocalError({message});
        if (callback) callback({ error: true, message });
    }
}
export const forgotPassStep2 = (hoTen, ngaySinh, ngayCap, setLocalStatus, setLocalError, callback, currentToken) => async (dispatch) => {
    dispatch({ type: AUTH_START });
    setLocalStatus(true); // Chuyển sang true để disable nút
    setLocalError(null);  // Xóa lỗi cũ
    
    try {
        const config = { headers: { 'Authorization': `Bearer ${currentToken}` } };
        const response = await axios.post(`${API_URL}/forgot-password/step2`, { hoTen, ngaySinh, ngayCap }, config);
        
        dispatch({ type: AUTH_TEMP_TOKEN_UPDATE, payload: response.data.tempToken });
        setLocalStatus(false); // Reset loading về false
        if (callback) callback(response.data);
    } catch (err) {
        setLocalStatus(false);
        const message = err.response?.data?.message || 'Lỗi xác thực.';
        setLocalError({ message }); // Đảm bảo setLocalError nhận một object có property message
        if (callback) callback({ error: true, message });
    }
}
export const forgotPassStep3 = (tempToken, setLocalStatus, setLocalError, callback) => async (dispatch) => {
    dispatch({ type: AUTH_START });
    setLocalStatus(true);
    const config = { headers: { 'Authorization': `Bearer ${tempToken}` } };
    try {
        const response = await axios.post(`${API_URL}/forgot-password/step3-send-otp`, {}, config);
        dispatch({ type: AUTH_TEMP_TOKEN_UPDATE, payload: response.data.finalToken });
        setLocalStatus(false);
        if (callback) callback(response.data);
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi gửi mã OTP.';
        setLocalStatus(false);
        setLocalError({ message });
        if (callback) callback({ error: true, message });
    }
};
// Bước 4: Kiểm tra OTP ngay lập tức
export const forgotPassStep4Verify = (otpCode, setLocalStatus, setLocalError, callback, resetToken) => async (dispatch) => {
    dispatch({ type: AUTH_START });
    setLocalStatus(true);
    const config = { headers: { 'Authorization': `Bearer ${resetToken}` } };
    try {
        const response = await axios.post(`${API_URL}/forgot-password/step4-otp`, { otpCode }, config);
        // Cập nhật token mới (chứa step 4) để chuẩn bị cho việc đổi pass
        dispatch({ type: AUTH_TEMP_TOKEN_UPDATE, payload: response.data.tempToken });
        setLocalStatus(false);
        if (callback) callback(response.data);
    } catch (e) {
        const message = e.response?.data?.message || 'Mã OTP không chính xác.';
        setLocalStatus(false);
        setLocalError({ message });
        if (callback) callback({ error: true, message });
    }
};

// Bước 5: Đặt lại mật khẩu mới
export const forgotPassStep5Final = (newPassword, confirmNewPassword, setLocalStatus, setLocalError, callback, resetToken) => async (dispatch) => {
    dispatch({ type: AUTH_START });
    setLocalStatus(true);
    const config = { headers: { 'Authorization': `Bearer ${resetToken}` } };
    try {
        const response = await axios.post(`${API_URL}/forgot-password/step5-final`, { newPassword, confirmNewPassword }, config);
        dispatch({ type: LOGOUT });
        setLocalStatus(false);
        if (callback) callback(response.data);
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi đặt lại mật khẩu.';
        setLocalStatus(false);
        setLocalError({ message });
        if (callback) callback({ error: true, message });
    }
};
export default function authReducer(state = initialState, action) {
    switch (action.type) {
    case AUTH_START:
        return {
            ...state,
            status: 'loading',
            error: null,
            sessionChecked: true,
        };

    case AUTH_SUCCESS:
        return {
            ...state,
            isAuthenticated: true,
            user: action.payload.user,
            status: 'succeeded',
            error: null,
        };

    case AUTH_FAIL:
        return {
            ...state,
            status: 'failed',
            error: action.payload,
        };

    case AUTH_VALIDATION_ERROR:
        return {
            ...state,
            status: 'failed',
            error: action.payload,
        };

    case LOGOUT:
        return {
            ...initialState,
            sessionChecked: true,
        };

    case FETCH_USER_SESSION_PENDING:
        return {
            ...state,
            status: 'loading',
            sessionChecked: false,
        };

    case FETCH_USER_SESSION_FULFILLED:
        return {
            ...state,
            isAuthenticated: true,
            user: action.payload,
            status: 'succeeded',
            error: null,
            sessionChecked: true,
        };

    case FETCH_USER_SESSION_REJECTED:
        return {
            ...state,
            isAuthenticated: false,
            user: null,
            status: 'failed',
            error: action.payload,
            sessionChecked: true,
        };

    case AUTH_TEMP_TOKEN_UPDATE:
        return {
            ...state,
            resetToken: action.payload,
            status: 'idle',
            error: null,
        };

    default:
        return state;
}

}
export const logoutUser= ()=>(dispatch)=>{
    axios.post(`${API_URL}/logout`).finally(()=>{
        dispatch({type: LOGOUT});
    })
    
};
export const fetchUserSession = createAsyncThunk(
    'auth/fetchUserSession',
    async(_,{ rejectWithValue}) =>{
        try{
            const response = await fetch(`${API_URL}/session`, {
                credentials: 'include',
                cache: 'no-store'
            });
            if(!response.ok){
                const errorStatus = response.status;
                throw new Error(`Session check failed:  ${errorStatus}.`);
            }
            const data = await response.json();
            return data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)