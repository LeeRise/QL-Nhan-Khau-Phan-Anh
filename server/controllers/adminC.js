
import { assignUserRole, removeUserRole } from '../models/admin.js' 
import { searchNhanKhau,getAllCanBoUsers } from '../models/admin.js';

export const assignRole = async (req, res) => {
    const { cccd, maVT } = req.body;

    try {
        const success = await assignUserRole(cccd, maVT);

        if (!success) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cấp quyền.' });
        }

        return res.status(200).json({ message: `Cấp vai trò (Ma_VT=${maVT}) cho CCCD ${cccd} thành công.` });

    } catch (error) {
        console.error("Assign role error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình cấp quyền.' });
    }
};


export const removeRole = async (req, res) => {
    const { cccd } = req.body;
    const defaultRoleMaVT = 6; 

    try {
        const success = await removeUserRole(cccd, defaultRoleMaVT);

        if (!success) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng hoặc vai trò không thể xóa.' });
        }

        return res.status(200).json({ message: `Đã gỡ vai trò, chuyển CCCD ${cccd} về Người Dân.` });

    } catch (error) {
        console.error("Remove role error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình gỡ quyền.' });
    }
};

export const searchNhanKhauC = async (req, res) => {
    const searchTerm = req.query.term; 

    if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập Mã CCCD hoặc Họ Tên để tìm kiếm.' });
    }

    try {
        const results = await searchNhanKhau(searchTerm);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nhân khẩu nào phù hợp.' });
        }
        
        return res.status(200).json(results);

    } catch (error) {
        console.error("Search Nhan Khau error:", error);
        return res.status(500).json({ message: 'Lỗi server trong quá trình tìm kiếm nhân khẩu.' });
    }
};
export const getCanBoList = async (req, res) => {
    try {
        const canBoList = await getAllCanBoUsers();

        if (canBoList.length === 0) {
            return res.status(200).json([]); 
        }
        
        return res.status(200).json(canBoList);

    } catch (error) {
        console.error("Get Can Bo List error:", error);
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách cán bộ.' });
    }
};