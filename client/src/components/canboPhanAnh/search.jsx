import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { searchPhanAnh } from '../redux/phananh';

const SearchFilter = () => {
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        tieuDe: '',
        loaiVanDe: '',
        trangThai: '',
        tuNgay: '',
        denNgay: ''
    });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(searchPhanAnh(filters));
    };

    return (
        <form onSubmit={handleSearch} className="filter-container">
            <input name="tieuDe" placeholder="Tìm tiêu đề..." onChange={handleChange} />
            <select name="loaiVanDe" onChange={handleChange}>
                <option value="">-- Loại vấn đề --</option>
                <option value="An ninh">An ninh</option>
                        <option value="Môi trường">Môi trường</option>
                        <option value="Hạ tầng">Hạ tầng</option>
                        <option value="Đời sống & Xã Hội">Đời sống & Xã Hội</option>
            </select>
            <select name="trangThai" onChange={handleChange}>
                <option value="">-- Trạng thái --</option>
                <option value="Chưa Tiếp nhận">Chưa Tiếp nhận</option>
                <option value="Đã tiếp nhận">Đã tiếp nhận</option>
                <option value="Đã xử lý">Đã xử lý</option>
            </select>
            <input type="date" name="tuNgay" onChange={handleChange} />
            <input type="date" name="denNgay" onChange={handleChange} />
            <button type="submit">Tìm kiếm</button>
        </form>
    );
};
export default SearchFilter;