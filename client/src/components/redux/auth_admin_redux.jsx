import axios from 'axios'
import {createAsyncThunk} from '@reduxjs/toolkit'
axios.defaults.withCredentials = true;

const AUTH_START = 'AUTH_START';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAIL = 'AUTH_FAIL';
const LOGOUT = 'LOGOUT';
const AUTH_VALIDATION_ERROR='AUTH_VALIDATION_ERROR';
const FETCH_USER_SESSION_FULFILLED = 'auth/fetchUserSession/fulfilled';
const FETCH_USER_SESSION_REJECTED = 'auth/fetchUserSession/rejected';
const FETCH_USER_SESSION_PENDING = 'auth/fetchUserSession/pending';
const LOGOUT_FULFILLED = 'auth/logoutUser/fulfilled';
const API_URL = 'http://localhost:3000/api/adminAuth';

const initialState = {
    isAuthenticated: false,
    token: null,
    user: null,
    status: 'idle',
    error: null,
    sessionChecked: false,
};

export const login = (ten_dn, mat_khau, setLocalStatus, setLocalError)=> async(dispatch)=>{
    dispatch({type: AUTH_START});
    setLocalStatus("loading");
    setLocalError(null);

    try{
        const response = await axios.post(`${API_URL}/login`,{ten_dn,mat_khau});

        const userData = {
            Ma_VT: response.data.Ma_VT,
            
        };
        dispatch({
            type: AUTH_SUCCESS,
            payload: {
                user: userData,
            },
        });
        setLocalStatus("success");
        setLocalError(null);
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
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/logout`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
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
export default function adminAuthReducer(state = initialState, action) {
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
        case AUTH_VALIDATION_ERROR:
            return {
                ...state,
                status: 'failed',
                error: action.payload,
            };

        case LOGOUT:
        case 'auth/logoutUser/fulfilled':
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

        default:
            return state;
    }
}
