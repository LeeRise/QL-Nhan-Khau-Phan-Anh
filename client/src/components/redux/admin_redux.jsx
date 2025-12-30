import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.withCredentials = true;

const ADMIN_OPERATION_START = 'admin/ADMIN_OPERATION_START';
const ADMIN_OPERATION_SUCCESS = 'admin/ADMIN_OPERATION_SUCCESS';
const ADMIN_OPERATION_FAIL = 'admin/ADMIN_OPERATION_FAIL';
const NHAN_KHAU_SEARCH_CLEAR = 'admin/NHAN_KHAU_SEARCH_CLEAR';
const CAN_BO_LIST_SUCCESS = 'admin/CAN_BO_LIST_SUCCESS';
const CAN_BO_LIST_FAIL = 'admin/CAN_BO_LIST_FAIL';

const API_URL = 'http://localhost:3000/api/admin_permisson';

const initialState = {
    searchStatus: 'idle',
    searchError: null,
    searchResults: [],
    operationStatus: 'idle',
    operationError: null,
    operationMessage: null,
    canBoList: [], 
    listStatus: 'idle', 
    listError: null,
};

export const assignRole = (cccd, maVT) => async (dispatch) => {
    dispatch({ type: ADMIN_OPERATION_START });

    try {
        const response = await axios.post(`${API_URL}/assign-role`, { cccd: String(cccd), maVT: Number(maVT) });

        dispatch({
            type: ADMIN_OPERATION_SUCCESS,
            payload: response.data.message || 'Cấp quyền thành công.'
        });
        return response.data;

    } catch (e) {
        const message = e.response?.data?.message || 'Cấp quyền không thành công.';
        dispatch({
            type: ADMIN_OPERATION_FAIL,
            payload: message,
        });
        throw new Error(message);
    }
};
export const fetchCanBoList = () => async (dispatch) => {
    dispatch({ type: ADMIN_OPERATION_START, payload: 'list' }); 
    dispatch({ type: 'admin/CAN_BO_LIST_PENDING' });

    try {
        const response = await axios.get(`${API_URL}/can-bo-list`);

        dispatch({
            type: CAN_BO_LIST_SUCCESS,
            payload: response.data,
        });
        return response.data;

    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi server khi tải danh sách cán bộ.';
        dispatch({
            type: CAN_BO_LIST_FAIL,
            payload: message,
        });
        throw new Error(message);
    }
};
export const removeRole = (cccd) => async (dispatch) => {
    dispatch({ type: ADMIN_OPERATION_START });

    try {
        const response = await axios.post(`${API_URL}/remove-role`, { cccd, maVT: 6 });

        dispatch({
            type: ADMIN_OPERATION_SUCCESS,
            payload: response.data.message || 'Gỡ quyền thành công.'
        });
        return response.data;

    } catch (e) {
        const message = e.response?.data?.message || 'Gỡ quyền không thành công.';
        dispatch({
            type: ADMIN_OPERATION_FAIL,
            payload: message,
        });
        throw new Error(message);
    }
};

export const searchNhanKhau = createAsyncThunk(
    'admin/searchNhanKhau',
    async (searchTerm, { rejectWithValue }) => {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                throw new Error('Vui lòng nhập thông tin tìm kiếm.');
            }

            const response = await axios.get(`${API_URL}/search-nhan-khau`, {
                params: { term: searchTerm }
            });

            if (response.data.length === 0) return [];
            return response.data;

        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Lỗi tìm kiếm.';
            return rejectWithValue(message);
        }
    }
);

export const clearNhanKhauSearch = () => ({ type: NHAN_KHAU_SEARCH_CLEAR });

export default function adminReducer(state = initialState, action) {
    switch (action.type) {
        case ADMIN_OPERATION_START:
            return {
                ...state,
                operationStatus: 'loading',
                operationError: null,
                operationMessage: null,
            };

        case ADMIN_OPERATION_SUCCESS:
            return {
                ...state,
                operationStatus: 'succeeded',
                operationMessage: action.payload,
                operationError: null,
            };

        case ADMIN_OPERATION_FAIL:
            return {
                ...state,
                operationStatus: 'failed',
                operationError: action.payload,
                operationMessage: null,
            };

        case searchNhanKhau.pending.type:
            return {
                ...state,
                searchStatus: 'loading',
                searchError: null,
                searchResults: [],
            };

        case searchNhanKhau.fulfilled.type:
            return {
                ...state,
                searchStatus: 'succeeded',
                searchResults: action.payload,
                searchError: null,
            };

        case searchNhanKhau.rejected.type:
            return {
                ...state,
                searchStatus: 'failed',
                searchResults: [],
                searchError: action.payload,
            };

        case NHAN_KHAU_SEARCH_CLEAR:
            return {
                ...state,
                searchResults: [],
                searchError: null,
                searchStatus: 'idle',
            };
        case 'admin/CAN_BO_LIST_PENDING':
            return {
                ...state,
                listStatus: 'loading',
                listError: null,
            };

        case CAN_BO_LIST_SUCCESS:
            return {
                ...state,
                listStatus: 'succeeded',
                canBoList: action.payload,
                listError: null,
            };

        case CAN_BO_LIST_FAIL:
            return {
                ...state,
                listStatus: 'failed',
                listError: action.payload,
                canBoList: [],
            };

        default:
            return state;
    }
}
