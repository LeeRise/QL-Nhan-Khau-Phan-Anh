import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/phanAnh';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (cccd) => {
        const response = await axios.get(`${API_URL}/${cccd}`);
        return response.data;
    }
);

export const markNotificationRead = createAsyncThunk(
    'notifications/markRead',
    async (id) => {
        await axios.put(`${API_URL}/read/${id}`);
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: { 
        list: [], 
        unreadCount: 0, 
        status: 'idle' 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.list = action.payload;
                state.unreadCount = action.payload.filter(n => !n.Da_Xem).length;
                state.status = 'succeeded';
            })
            
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const notiId = action.payload;
                const existingNoti = state.list.find(n => n.Ma_TB === notiId);
                
                if (existingNoti && !existingNoti.Da_Xem) {
                    existingNoti.Da_Xem = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    },
});

export default notificationSlice.reducer;