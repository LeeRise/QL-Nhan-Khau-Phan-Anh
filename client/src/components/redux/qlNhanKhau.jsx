import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.withCredentials = true;

const API_URL = 'http://localhost:3000/api/hoKhau';


// 1. Đăng ký hộ khẩu mới (handleRegisterNewHousehold)
export const registerNewHousehold = createAsyncThunk(
    'qlnhankhau/registerNewHousehold',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/household/register`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi đăng ký hộ khẩu mới');
        }
    }
);

// 2. Tách hộ khẩu (handleSplitHousehold)
export const splitHousehold = createAsyncThunk(
    'qlnhankhau/splitHousehold',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/household/split`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tách hộ khẩu');
        }
    }
);

// 3. Tìm kiếm thành viên hộ (handleGetHouseholdMembers)
export const getHouseholdMembers = createAsyncThunk(
    'qlnhankhau/getHouseholdMembers',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/household/members`, { params: filters });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tìm kiếm thành viên');
        }
    }
);

// 4. Lịch sử hộ khẩu (handleGetHouseholdHistory)
export const getHouseholdHistory = createAsyncThunk(
    'qlnhankhau/getHouseholdHistory',
    async (maHK, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/household/history/${maHK}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi lấy lịch sử hộ khẩu');
        }
    }
);

// 5. Thêm nhân khẩu mới (handleAddMember)
export const addMember = createAsyncThunk(
    'qlnhankhau/addMember',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/member/add`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi thêm nhân khẩu');
        }
    }
);

// 6. Cập nhật thông tin (handleUpdatePersonInfo)
export const updatePersonInfo = createAsyncThunk(
    'qlnhankhau/updatePersonInfo',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/member/update`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật thông tin');
        }
    }
);

// 7. Nhân khẩu chuyển đi/qua đời (handleMemberDepartureController)
export const memberDeparture = createAsyncThunk(
    'qlnhankhau/memberDeparture',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/member/departure`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi xử lý nhân khẩu đi');
        }
    }
);

// 8. Đăng ký tạm trú/vắng (handleRegisterResidence)
export const registerResidenceChange = createAsyncThunk(
    'qlnhankhau/registerResidenceChange',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/member/residence-change`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi đăng ký cư trú');
        }
    }
);

// 9. Thống kê dân số (handleGetDemographicStats)
export const getDemographicStats = createAsyncThunk(
    'qlnhankhau/getDemographicStats',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stats/demographic`, { params: filters });
            return response.data.data; // Đảm bảo backend trả về mảng trong trường 'data'
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tìm kiếm');
        }
    }
);

// 10. Thống kê biến động cư trú (handleGetResidenceStats)
export const getResidenceStats = createAsyncThunk(
    'qlnhankhau/getResidenceStats',
    async (query, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stats/residence-fluctuation`, { params: query });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi thống kê biến động');
        }
    }
);

// 11. Đếm số lượng trẻ em (handleGetChildrenCount)
export const getDashboardStats = createAsyncThunk(
    'qlnhankhau/getDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stats/children-count`);
            return response.data.data.total;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi đếm số trẻ em');
        }
    }
);
// 12. Chuyển đi cả hộ
export const moveEntireHousehold = createAsyncThunk(
    'qlnhankhau/moveEntireHousehold',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/household/move-entire`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Lỗi khi chuyển đi cả hộ' 
            );
        }
    }
);
// 13. Kiểm tra thông tin nhân khẩu trước khi thêm (checkMemberByCCCD)
export const checkMemberByCCCD = createAsyncThunk(
    'qlnhankhau/checkMemberByCCCD',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/member/check`,{
                params: searchParams
            });
            return response.data; // Trả về { success, exists, data }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Lỗi khi kiểm tra CCCD'
            );
        }
    }
);
// 14. Kiểm tra cho tạm trú tạm vắng 
export const checkMemberStatus = createAsyncThunk(
    'qlnhankhau/checkMemberStatus',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/member/check-status`,{
                params: searchParams
            });
            
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể kết nối đến máy chủ"
            );
        }
    }
);
const initialState = {
    loading: false,
    error: null,
    success: false,
    message: '',
    dashboardStats: {
        totalHoKhau: 0,
        totalDanThuongTru: 0,
        totalTamTru: 0,
        totalTamVang: 0,
        totalChildren: 0,
        totalPopulation: 0
    },
    householdMembers: [], 
    householdHistory: [], 
    demographicStats: [], 
    residenceStats: null, 
    checkedMember: null,     
    isCheckingCCCD: false,
    exists: false,
    hasHauKhau: false
    
};

const qlnhankhauSlice = createSlice({
    name: 'qlnhankhau',
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = '';
            state.checkedMember = null;
            state.isCheckingCCCD = false;
            state.exists = false;
            state.hasHauKhau = false;
        },
        clearHouseholdData: (state) => {
            state.householdMembers = [];
            state.householdHistory = [];
        }
    },
    extraReducers: (builder) => {
        builder


             .addCase(checkMemberByCCCD.pending, (state) => {
                state.isCheckingCCCD = true;
                state.error = null;
                state.checkedMember = null;
            })
            .addCase(checkMemberByCCCD.fulfilled, (state, action) => {
                state.isCheckingCCCD = false;
                state.checkedMember = action.payload.exists ? action.payload.data : null;
            })
            .addCase(checkMemberByCCCD.rejected, (state, action) => {
                state.isCheckingCCCD = false;
                state.error = action.payload; 
                state.checkedMember = null;
            })

.addCase(checkMemberStatus.pending, (state) => {
    state.isCheckingCCCD = true;
    state.error = null;
    state.checkedMember = null;
    state.exists = false;
})
.addCase(checkMemberStatus.fulfilled, (state, action) => {
    state.isCheckingCCCD = false;
    state.exists = action.payload.exists;
    state.checkedMember = action.payload.data;
})
.addCase(checkMemberStatus.rejected, (state, action) => {
    state.isCheckingCCCD = false;
    
    if (action.payload && action.payload.conflict) {
        state.checkedMember = action.payload.data; 
        state.exists = true; 
        state.error = action.payload.message;
        state.success = false;
    } else {
        state.error = action.payload;
        state.success = false;
    }
})
            .addCase(getHouseholdMembers.fulfilled, (state, action) => {
                state.householdMembers = action.payload;
                state.loading = false;
                if (!action.payload || action.payload.length === 0) {
                    state.error = "Không tìm thấy thông tin hộ khẩu hoặc hộ khẩu không có thành viên.";
                }
            })
            .addCase(getHouseholdMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.householdMembers = []; 
            })

            .addCase(getHouseholdMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.householdMembers = []; 
            })
            .addCase(getHouseholdHistory.fulfilled, (state, action) => {
                state.householdHistory = action.payload;
            })
            .addCase(getDemographicStats.fulfilled, (state, action) => {
                state.demographicStats = action.payload;
            })
            .addCase(getResidenceStats.fulfilled, (state, action) => {
                state.residenceStats = action.payload;
            })
.addCase(getDashboardStats.fulfilled, (state, action) => {
    state.dashboardStats = action.payload;
})
            .addMatcher(
            (action) => action.type.endsWith('/pending') && 
                        !action.type.includes('get') && 
                        !action.type.includes('check'), 
            (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            }
        )
            .addMatcher(
            (action) => action.type.endsWith('/fulfilled') && 
                        !action.type.includes('get') && 
                        !action.type.includes('check'), 
            (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload?.message || "Thao tác thành công";
            }
        )

        .addMatcher(
            (action) => action.type.endsWith('/rejected') && 
                        !action.type.includes('get') && 
                        !action.type.includes('check'), 
            (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            }
        );
        

           
    },
});

export const { resetStatus, clearHouseholdData } = qlnhankhauSlice.actions;
export default qlnhankhauSlice.reducer; 