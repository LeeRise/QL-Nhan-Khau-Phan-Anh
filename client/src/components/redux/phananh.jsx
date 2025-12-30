import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.withCredentials = true;

const PHAN_ANH_START = 'phanAnh/PHAN_ANH_START';
const PHAN_ANH_FAIL = 'phanAnh/PHAN_ANH_FAIL';
const DELETE_SUCCESS = 'phanAnh/DELETE_SUCCESS';
const SUBMIT_SUCCESS = 'phanAnh/SUBMIT_SUCCESS';
const FETCH_SUMMARY_SUCCESS = 'phanAnh/FETCH_SUMMARY_SUCCESS';
const FETCH_DETAIL_SUCCESS = 'phanAnh/FETCH_DETAIL_SUCCESS';
const FETCH_STATS_SUCCESS = 'phanAnh/FETCH_STATS_SUCCESS';
const FETCH_MY_HISTORY_SUCCESS = 'phanAnh/FETCH_MY_HISTORY_SUCCESS';
const CLEAR_CURRENT_DETAIL = 'phanAnh/CLEAR_CURRENT_DETAIL';
const SEARCH_SUCCESS = 'phanAnh/SEARCH_SUCCESS';
const UPDATE_STATUS_SUCCESS = 'phanAnh/UPDATE_STATUS_SUCCESS';
const API_URL = 'http://localhost:3000/api/phanAnh';

const initialState = {
    status: 'idle',
    error: null,
    message: null,
    summaryList: [],
    myHistory: [],
    currentDetail: null,
    statistics: { 
        ChuaTiepNhan: 0,
        DaTiepNhan: 0,
        DaXuLy: 0,
        TongSo: 0
    }
};

export const submitNewPhanAnh = (tieuDe,ndPA, loaiVanDe, cccd, files,isAnDanh) => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.post(`${API_URL}/create`, { tieuDe,ndPA, loaiVanDe, cccd, files ,isAnDanh});
        dispatch({
            type: SUBMIT_SUCCESS,
            payload: response.data.message || 'Gửi phản ánh thành công.'
        });
        return response.data;
    } catch (e) {
        const message = e.response?.data?.message || 'Không thể gửi phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
        throw new Error(message);
    }
};
export const searchPhanAnh = (filters) => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.get(`${API_URL}/searchPhanAnh`, { 
            params: filters 
        });
        dispatch({ 
            type: SEARCH_SUCCESS, 
            payload: response.data 
        });
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi tìm kiếm phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
    }
};
export const updatePhanAnhStatus = (data) => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.post(`${API_URL}/Phanhoi`, data);
        dispatch({ 
            type: UPDATE_STATUS_SUCCESS, 
            payload: response.data.message || 'Cập nhật phản hồi thành công.' 
        });
        return response.data;
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi cập nhật phản hồi.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
        throw new Error(message);
    }
};
export const fetchPhanAnhStatistics = () => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.get(`${API_URL}/getPAstatics`);
        dispatch({ 
            type: FETCH_STATS_SUCCESS, 
            payload: response.data.data 
        });
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi tải thống kê phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
    }
};
export const fetchAllSummary = () => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.get(`${API_URL}/allSummary`);
        dispatch({ type: FETCH_SUMMARY_SUCCESS, payload: response.data });
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi tải danh sách phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
    }
};

export const fetchPhanAnhDetail = (maPA) => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.get(`${API_URL}/detail/${maPA}`);
        dispatch({ type: FETCH_DETAIL_SUCCESS, payload: response.data });
    } catch (e) {
        const message = e.response?.data?.message || 'Không thể tải chi tiết phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
    }
};

export const fetchMyHistory = (cccd) => async (dispatch) => {
    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.get(`${API_URL}/getMyHistory`, {
            params: { cccd }
        });
        dispatch({ type: FETCH_MY_HISTORY_SUCCESS, payload: response.data });
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi tải lịch sử cá nhân.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
    }
};
export const deletePhanAnh = (maPA, cccd) => async (dispatch) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản ánh này?")) return;

    dispatch({ type: PHAN_ANH_START });
    try {
        const response = await axios.delete(`${API_URL}/delete/${maPA}`);
        
        dispatch({ 
            type: DELETE_SUCCESS, 
            payload: maPA 
        });
        
        alert(response.data.message || "Xóa thành công!");
    } catch (e) {
        const message = e.response?.data?.message || 'Lỗi khi xóa phản ánh.';
        dispatch({ type: PHAN_ANH_FAIL, payload: message });
        alert(message);
    }
};
export const clearCurrentDetail = () => ({ type: CLEAR_CURRENT_DETAIL });

export default function phanAnhReducer(state = initialState, action) {
    switch (action.type) {
        case PHAN_ANH_START:
            return {
                ...state,
                status: 'loading',
                error: null,
                message: null,
            };

        case PHAN_ANH_FAIL:
            return {
                ...state,
                status: 'failed',
                error: action.payload,
            };

        case SUBMIT_SUCCESS:
        case UPDATE_STATUS_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                message: action.payload,
            };

        case FETCH_SUMMARY_SUCCESS:
        case SEARCH_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                summaryList: action.payload,
            };

        case FETCH_DETAIL_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                currentDetail: action.payload,
            };

        case FETCH_MY_HISTORY_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                myHistory: action.payload,
            };

        case FETCH_STATS_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                statistics: action.payload,
            };
        case CLEAR_CURRENT_DETAIL:
            return {
                ...state,
                currentDetail: null,
            };
        case DELETE_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                myHistory: state.myHistory.filter(pa => pa.Ma_PA !== action.payload),
                summaryList: state.summaryList.filter(pa => pa.Ma_PA !== action.payload),
                message: "Xóa phản ánh thành công"
            };

        default:
            return state;
    }
}
