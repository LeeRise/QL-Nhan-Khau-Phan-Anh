import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.withCredentials = true;

const API_URL = 'http://localhost:3000/api/myInfo';

export const fetchPersonalProfile = createAsyncThunk(
    'nhankhau/fetchPersonalProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/getMyInfo`);
            return response.data.personal; 
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể lấy thông tin cá nhân.';
            return rejectWithValue(message);
        }
    }
);

export const fetchHouseholdDetails = createAsyncThunk(
    'nhankhau/fetchHouseholdDetails',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/getMyInfo1`);
            return response.data.household;
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể lấy thông tin hộ khẩu.';
            return rejectWithValue(message);
        }
    }
);
export const searchHouseholdMembersAction = createAsyncThunk(
    'nhankhau/searchHouseholdMembers',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/getMember`, {
                params: filters
            });
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Lỗi khi tìm kiếm thành viên hộ gia đình.';
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    personalData: null,
    personalStatus: 'idle', 
    personalError: null,

    householdData: {
        info: null,
        members: []
    },
    householdStatus: 'idle',
    householdError: null,
    searchResult: [],
    searchStatus: 'idle',
    searchError: null,
};

const nhankhauSlice = createSlice({
    name: 'nhankhau',
    initialState,
    reducers: {
        clearNhanKhauData: (state) => {
            return initialState;
        },
        clearSearchResult: (state) => {
            state.searchResult = [];
            state.searchStatus = 'idle';
            state.searchError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPersonalProfile.pending, (state) => {
                state.personalStatus = 'loading';
                state.personalError = null;
            })
            .addCase(fetchPersonalProfile.fulfilled, (state, action) => {
                state.personalStatus = 'succeeded';
                state.personalData = action.payload;
            })
            .addCase(fetchPersonalProfile.rejected, (state, action) => {
                state.personalStatus = 'failed';
                state.personalError = action.payload;
            })
            .addCase(fetchHouseholdDetails.pending, (state) => {
                state.householdStatus = 'loading';
                state.householdError = null;
            })
            .addCase(fetchHouseholdDetails.fulfilled, (state, action) => {
                state.householdStatus = 'succeeded';
                state.householdData = action.payload;
            })
            .addCase(fetchHouseholdDetails.rejected, (state, action) => {
                state.householdStatus = 'failed';
                state.householdError = action.payload;
            })
            .addCase(searchHouseholdMembersAction.pending, (state) => {
                state.searchStatus = 'loading';
                state.searchError = null;
            })
            .addCase(searchHouseholdMembersAction.fulfilled, (state, action) => {
                state.searchStatus = 'succeeded';
                state.searchResult = action.payload; 
            })
            .addCase(searchHouseholdMembersAction.rejected, (state, action) => {
                state.searchStatus = 'failed';
                state.searchError = action.payload;
            });
    },
});

export const { clearNhanKhauData,clearSearchResult } = nhankhauSlice.actions;
export default nhankhauSlice.reducer;