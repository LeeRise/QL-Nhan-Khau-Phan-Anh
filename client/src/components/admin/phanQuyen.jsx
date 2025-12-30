import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    searchNhanKhau, 
    assignRole, 
    removeRole, 
    fetchCanBoList, 
    clearNhanKhauSearch 
} from '../redux/admin_redux';

const CapQuyen = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState(6);

    const { 
        searchResults, searchStatus, 
        canBoList, listStatus, 
        operationStatus, operationMessage, operationError 
    } = useSelector(state => state.adminData);

    const getRoleName = (maVT) => {
    switch (maVT) {
        case 2: return "Tổ Trưởng";
        case 3: return "Tổ Phó";
        case 4: return "Cán bộ Hộ khẩu";
        case 5: return "Cán bộ Phản ánh";
    }
};
    useEffect(() => {
        dispatch(fetchCanBoList());
        return () => dispatch(clearNhanKhauSearch());
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(searchNhanKhau(searchTerm));
    };

    const handleAssign = async (cccd) => {
        if (window.confirm("Xác nhận cấp quyền cho người này?")) {
            try {
                await dispatch(assignRole(cccd, selectedRole));
                dispatch(fetchCanBoList());
                dispatch(clearNhanKhauSearch());
                setSearchTerm('');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleRemove = async (cccd) => {
        if (window.confirm("Xác nhận gỡ quyền cán bộ này?")) {
            try {
                await dispatch(removeRole(cccd));
                dispatch(fetchCanBoList());
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="cap-quyen-container">
            <h2>Hệ Thống Phân quyền </h2>

            <div className="search-section">
                <h3>Cấp quyền mới</h3>
                <form onSubmit={handleSearch} className="search-form">
                    <input 
                        type="text" 
                        placeholder="Nhập CCCD hoặc Tên để tìm kiếm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" disabled={searchStatus === 'loading'}>
                        {searchStatus === 'loading' ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="results-table">
                        <h4>Kết quả tìm kiếm:</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã CCCD</th>
                                    <th>Họ tên</th>
                                    <th>Chọn vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map(person => (
                                    <tr key={person.Ma_CCCD}>
                                        <td>{person.Ma_CCCD}</td>
                                        <td>{person.Ho_Ten}</td>
                                        <td>
                                            <select onChange={(e) => setSelectedRole(Number(e.target.value))}>
                                                <option value="6">Người dân </option>
                                                <option value="5">Cán bộ Phản ánh </option>
                                                <option value="4">Cán bộ Hộ khẩu </option>
                                                <option value="3">Tổ Phó </option>
                                                <option value="2">Tổ Trưởng </option>
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-assign" 
                                                onClick={() => handleAssign(person.Ma_CCCD)}
                                            >
                                                Cấp quyền
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <hr />

            <div className="list-section">
                <h3>Danh sách cán bộ đang hoạt động</h3>
                {listStatus === 'loading' ? <p>Đang tải danh sách...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã CCCD</th>
                                <th>Họ tên</th>
                                <th>Mã vai trò</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {canBoList.map(cb => (
                                <tr key={cb.Ma_CCCD}>
                                    <td>{cb.Ma_CCCD}</td>
                                    <td>{cb.Ho_Ten}</td>
                                    <td><span className={`role-badge role-${cb.Ma_VT}`}>{getRoleName(cb.Ma_VT)}</span></td>
                                    <td>
                                        <button 
                                            className="btn-remove" 
                                            onClick={() => handleRemove(cb.Ma_CCCD)}
                                        >
                                            Gỡ quyền
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {operationMessage && <div className="alert alert-success">{operationMessage}</div>}
            {operationError && <div className="alert alert-danger">{operationError}</div>}
        </div>
    );
};

export default CapQuyen;