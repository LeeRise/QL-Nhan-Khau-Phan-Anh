import { 
    createPhanAnh, 
    getSummaryPhanAnh, 
    getPhanAnhDetail, 
    getMyPhanAnhHistory ,
    searchPhanAnhComplex,
    processPhanAnh,
    deletePhanAnhByResident,
    getPhanAnhStatistics
} from '../models/phananh.js';
import mssql from 'mssql'
// 1. Người dân tạo phản ánh mới
export const submitPhanAnh = async (req, res) => {
    const { tieuDe,ndPA, loaiVanDe, cccd, files,isAnDanh } = req.body;

    if (!tieuDe || !cccd) {
        return res.status(400).json({ message: 'Tiêu đề và Mã CCCD là bắt buộc.' });
    }

    try {
        const phanAnhData = {
            Tieu_De: tieuDe,
            ND_PA:ndPA,
            Loai_Van_De: loaiVanDe,
            Ma_CCCD: cccd,
            Is_An_Danh: isAnDanh ? 1 : 0
        };

        const result = await createPhanAnh(phanAnhData, files || []);

        return res.status(201).json({
            message: 'Gửi phản ánh thành công.',
            maPA: result.maPA
        });
    } catch (error) {
        console.error("Submit Phan Anh error:", error);
        return res.status(500).json({ message: error.message || 'Lỗi server khi gửi phản ánh.' });
    }
};

// 2. Tổng hợp tất cả phản ánh (Dành cho Cán bộ xử lý)
export const getAllSummary = async (req, res) => {
    try {
        const results = await getSummaryPhanAnh();

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error("Get Summary Phan Anh error:", error);
        return res.status(500).json({ message: 'Lỗi server khi lấy danh sách tổng hợp phản ánh.' });
    }
};

// 3. Thông tin chi tiết phản ánh (Gồm thông tin gốc, file đính kèm và phản hồi)
export const getDetail = async (req, res) => {
    const { maPA } = req.params; 

    if (!maPA) {
        return res.status(400).json({ message: 'Thiếu Mã Phản Ánh.' });
    }

    try {
        const details = await getPhanAnhDetail(maPA);

        if (!details || !details.info) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin phản ánh này.' });
        }

        return res.status(200).json(details);
    } catch (error) {
        console.error("Get Detail Phan Anh error:", error);
        return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phản ánh.' });
    }
};

// 4. Lấy lịch sử phản ánh của riêng 1 người dân (Dùng cho trang theo dõi của Dân)
export const getMyHistory = async (req, res) => {
    const { cccd } = req.query; 

    if (!cccd) {
        return res.status(400).json({ message: 'Mã CCCD không được để trống.' });
    }

    try {
        const results = await getMyPhanAnhHistory(cccd);
        return res.status(200).json(results);
    } catch (error) {
        console.error("Get My History error:", error);
        return res.status(500).json({ message: 'Lỗi server khi lấy lịch sử phản ánh cá nhân.' });
    }
};

export const handleSearchPhanAnh = async (req, res) => {
    try {
        const results = await searchPhanAnhComplex(req.query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleUpdateStatus = async (req, res) => {
    const { maPA, trangThai, noiDung, maCCCD_CB } = req.body;
    try {
        await processPhanAnh(maPA, trangThai, noiDung, maCCCD_CB);
        res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const handleDeletePhanAnh = async (req, res) => {
    const { maPA } = req.params;
    const maCCCD = req.user.Ma_CCCD; 

    if (!maPA) {
        return res.status(400).json({ message: 'Thiếu mã phản ánh để xóa.' });
    }

    try {
        await deletePhanAnhByResident(maPA, maCCCD);
        return res.status(200).json({ message: 'Xóa phản ánh thành công.' });
    } catch (error) {
        return res.status(400).json({ message: error.message || 'Lỗi khi xóa phản ánh.' });
    }
};

export const handleGetPhanAnhStatistics = async (req, res) => {
    try {
        const stats = await getPhanAnhStatistics();
        
        res.status(200).json({
            status: "success",
            data: stats
        });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
export const getNotifications = async (req, res) => {
    try {
        const { cccd } = req.params;
        const result = await global.sqlPool.request()
            .input('cccd', mssql.VarChar, cccd)
            .query(`SELECT * FROM Thong_Bao WHERE Ma_CCCD_NguoiNhan = @cccd ORDER BY Ngay_Tao DESC`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await global.sqlPool.request()
            .input('id', mssql.Int, id)
            .query(`UPDATE Thong_Bao SET Da_Xem = 1 WHERE Ma_TB = @id`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};