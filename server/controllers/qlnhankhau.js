import { searchHouseholdMembers, splitHousehold,
    moveEntireHousehold,registerResidenceChange,
    checkMemberStatusBeforeAdd, getResidenceFluctuationStats,
    getHouseholdHistory, addMember,handleMemberDeparture,
    updatePersonInfo,searchPopulation,checkMemberStatusBeforeAdd1
 } from "../models/qlnhankhau.js"; 
import { registerNewHousehold } from "../models/qlnhankhau.js";
export const handleGetHouseholdMembers = async (req, res) => {
    try {
        const { maHK, cccdChuHo, HotenChuHo } = req.query;

        if (!maHK && !cccdChuHo && !HotenChuHo) {
            return res.status(400).json({
                message: "Vui lòng cung cấp MaHK, CCCD chủ hộ hoặc Tên chủ hộ để tìm kiếm."
            });
        }

        const members = await searchHouseholdMembers({ 
            maHK: maHK ? parseInt(maHK) : null, 
            cccdChuHo, 
            HotenChuHo 
        });

        if (!members || members.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy thông tin hộ gia đình phù hợp."
            });
        }

        return res.status(200).json({
            status: "success",
            count: members.length,
            data: members
        });

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi truy xuất danh sách thành viên hộ khẩu.",
            error: error.message
        });
    }
};
//Tách hộ khẩu
export const handleSplitHousehold = async (req, res) => {
    try {
        const { MaHKCu, MaCCCD_ChuHoMoi, DiaChiMoi, DanhSachThanhVien } = req.body;

        if (!MaHKCu || !MaCCCD_ChuHoMoi || !DiaChiMoi || !DanhSachThanhVien) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết để tách hộ." });
        }

        const result = await splitHousehold({ 
            MaHKCu, MaCCCD_ChuHoMoi, DiaChiMoi, DanhSachThanhVien 
        });

        return res.status(201).json({
            status: "success",
            message: "Tách hộ khẩu thành công.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi tách hộ khẩu.", error: error.message });
    }
};
//chuyển đi cả hộ 
export const handleMoveEntireHousehold = async (req, res) => {
    try {
        const { maHK,cccdChuHo, hoTenChuHo, ngayChuyen, noiDen, lyDo } = req.body;

        if (!(maHK || cccdChuHo || hoTenChuHo)|| !ngayChuyen) {
            return res.status(400).json({ message: "Mã hộ khẩu và ngày chuyển là bắt buộc." });
        }

        const result = await moveEntireHousehold({ maHK, cccdChuHo, hoTenChuHo, ngayChuyen, noiDen, lyDo });

        return res.status(200).json({
            status: "success",
            message: result.message
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi chuyển đi cả hộ.", error: error.message });
    }
};
//Tạm Trú Tạm Vắng
export const handleRegisterResidence = async (req, res) => {
    try {
        const data = req.body; 

        if (!data.loaiHinh || !data.tuNgay) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ CCCD, loại hình và ngày bắt đầu." });
        }
         

        const result = await registerResidenceChange(data);

        return res.status(200).json({
            status: "success",
            message: `Đăng ký ${data.loaiHinh} thành công.`,
            data: result
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi đăng ký cư trú.", error: error.message });
    }
};
// Thống kê dân số
export const handleGetDemographicStats = async (req, res) => {
    try {
        // Lấy các tiêu chí tìm kiếm từ req.query (ví dụ: ?hoTen=Nam&tuoiTu=20)
        const { 
            hoTen, 
            tuoiTu, 
            tuoiDen, 
            noiLamViec, 
            dcTT, 
            queQuan, 
            dcTTTruoc, 
            ngheNghiep, 
            noiSinh,
            ngayDKThuongTru 
        } = req.query;

        // Truyền đối tượng chứa các tiêu chí vào hàm model
        const results = await searchPopulation({
            hoTen,
            tuoiTu,
            tuoiDen,
            noiLamViec,
            dcTT,
            queQuan,
            dcTTTruoc,
            ngheNghiep,
            noiSinh,
            ngayDKThuongTru
        });

        return res.status(200).json({ 
            status: "success", 
            count: results.length, // Trả về số lượng tìm thấy để cán bộ biết
            data: results 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Lỗi khi tìm kiếm danh sách nhân khẩu.", 
            error: error.message 
        });
    }
};
//thống kê tạm trú tạm vắng
export const handleGetResidenceStats = async (req, res) => {
    try {
        const { startDate, endDate,loai } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Vui lòng chọn khoảng thời gian thống kê." });
        }

        const stats = await getResidenceFluctuationStats({ startDate, endDate, loai: loai || 'Tất cả' });
        return res.status(200).json({ status: "success", data: stats });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi khi lấy thống kê biến động.", error: error.message });
    }
};
// lịch sử 1 hộ
export const handleGetHouseholdHistory = async (req, res) => {
    try {
        const { maHK } = req.params; // Thường dùng /history/:maHK

        if (!maHK) {
            return res.status(400).json({ message: "Mã hộ khẩu không hợp lệ." });
        }

        const history = await getHouseholdHistory(parseInt(maHK));

        return res.status(200).json({
            status: "success",
            count: history.length,
            data: history
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi truy xuất lịch sử hộ khẩu.", error: error.message });
    }
};
// thêm nhân khẩu khẩu mới 
export const handleAddMember = async (req, res) => {
    try {
        const memberData = req.body;
        if ( !memberData.maHK || !memberData.hoTen) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc (CCCD, Mã hộ khẩu, Họ tên)."
            });
        }

        const result = await addMember(memberData);

        return res.status(201).json({
            status: "success",
            message: "Thêm nhân khẩu mới thành công.",
            data: result
        });
    } catch (error) {
        console.error("Add Member Controller Error:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi thêm nhân khẩu.",
            error: error.message
        });
    }
};
// kiểm tra tồn tại chưa

export const handleCheckMemberForAdd = async (req, res) => {
    try {
        const { cccd, hoTen, ngaySinh, queQuan } = req.query;

        if (!cccd && !(hoTen && ngaySinh && queQuan)) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cung cấp CCCD hoặc bộ ba (Họ tên, Ngày sinh, Quê quán)" 
            });
        }

        const result = await checkMemberStatusBeforeAdd({ 
            maCCCD: cccd, 
            hoTen, 
            ngaySinh, 
            queQuan 
        });

        if (!result.allowed) {
            return res.status(400).json({
                success: false,
                conflict: true,
                message: result.message,
                data: result.data
            });
        }

        return res.status(200).json({
            success: true,
            exists: result.exists,
            data: result.data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi kiểm tra nhân khẩu",
            error: error.message
        });
    }
};
//kiểm tra trước tạm trú tạm vắng
export const handleCheckMemberStatus = async (req, res) => {
    try {
        const { cccd, hoTen, ngaySinh, queQuan } = req.query;

        if (!cccd && !(hoTen && ngaySinh && queQuan)) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp CCCD hoặc đầy đủ Họ tên, Ngày sinh, Quê quán"
            });
        }

        const result = await checkMemberStatusBeforeAdd1({ 
            maCCCD: cccd, 
            hoTen, 
            ngaySinh, 
            queQuan 
        });

        if (result.allowed === false) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            exists: result.exists,
            hasHauKhau: result.hasHauKhau,
            message: result.exists 
                ? "Tìm thấy thông tin nhân khẩu trên hệ thống." 
                : "Nhân khẩu mới (chưa có dữ liệu).",
            data: result.data
        });

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi kiểm tra thông tin nhân khẩu"
        });
    }
};
// chuyển đi hoặc qua đời 
export const handleMemberDepartureController = async (req, res) => {
    try {
        const { 
            cccd, 
            maHK, 
            lyDo, 
            ngayThucHien, 
            noiDen, 
            cccdChuHoMoi, 
            danhSachQuanHeMoi 
        } = req.body;

        if (!cccd || !maHK || !lyDo || !ngayThucHien) {
            return res.status(400).json({
                message: "Vui lòng cung cấp đầy đủ: CCCD, Mã HK, Lý do và Ngày thực hiện."
            });
        }
 
        const result = await handleMemberDeparture({
            cccd,
            maHK,
            lyDo,
            ngayThucHien,
            noiDen,
            cccdChuHoMoi,
            danhSachQuanHeMoi
        });

        return res.status(200).json({
            status: "success",
            message: result.message
        });
    } catch (error) {
        console.error("Departure Controller Error:", error);
        const statusCode = error.message.includes("Vui lòng chỉ định Chủ hộ mới") ? 400 : 500;
        return res.status(statusCode).json({
            message: "Lỗi khi xử lý nhân khẩu chuyển đi/qua đời.",
            error: error.message
        });
    }
};
// cập nhật thông tin cá nhân 
export const handleUpdatePersonInfo = async (req, res) => {
    try {
        const data = req.body;

        if (!data.Ma_CCCD) {
            return res.status(400).json({
                message: "Thiếu số CCCD để xác định nhân khẩu cần cập nhật."
            });
        }

        const result = await updatePersonInfo(data);

        return res.status(200).json({
            status: "success",
            message: result.message
        });
    } catch (error) {
        console.error("Update Person Controller Error:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật thông tin nhân khẩu.",
            error: error.message
        });
    }
};
// hàm thêm hộ khẩu mới
export const handleRegisterNewHousehold = async (req, res) => {
    try {
        const { diaChi, cccdChuHo, ngayLap, members } = req.body;

        if (!diaChi || !cccdChuHo) {
            return res.status(400).json({
                message: "Thiếu thông tin địa chỉ hoặc CCCD chủ hộ."
            });
        }
        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                message: "Danh sách thành viên không được để trống."
            });
        }
        const formattedMembers = members.map(m => ({
            cccd: m.cccd || m.Ma_CCCD, // Khớp với member.cccd
            hoTen: m.hoTen || m.Ho_Ten,
            ngaySinh: m.ngaySinh || m.Ngay_Sinh,
            ngayCap: m.ngayCap || m.Ngay_Cap_CC,
            noiCap: m.noiCap || m.Noi_Cap,
            dcTT: m.dcTT || m.DC_TT || diaChi,
            gioiTinh: m.gioiTinh || m.Gioi_Tinh,
            email: m.email || m.Email,
            queQuan: m.queQuan || m.Que_Quan,
            noiSinh: m.noiSinh || m.Noi_Sinh,
            ttHonNhan: m.ttHonNhan || m.TT_Hon_Nhan,
            biDanh: m.biDanh || m.Bi_Danh,
            ngheNghiep: m.ngheNghiep || m.Nghe_Nghiep,
            danToc: m.danToc || m.Dan_Toc,
            ngayDKThuongTru: m.ngayDKThuongTru || m.ngayDK || ngayLap,
            dcThuongTruTruoc: m.dcThuongTruTruoc || m.dcTruoc, 
            noiLamViec: m.noiLamViec || m.Noi_Lam_Viec,
            quanHe: m.quanHe || (m.cccd === cccdChuHo ? 'Chủ hộ' : 'Thành viên')
        }));
        const result = await registerNewHousehold({
            diaChi,
            cccdChuHo,
            ngayLap: ngayLap || new Date(),
            members: formattedMembers
        });

        return res.status(201).json({
            status: "success",
            message: "Đăng ký hộ khẩu mới và danh sách nhân khẩu thành công.",
            maHK: result.maHK
        });

    } catch (error) {
        console.error("Register Household Controller Error:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi đăng ký hộ khẩu mới.",
            error: error.message
        });
    }
};

import {getDashboardStats}  from "../models/qlnhankhau.js";

export const handleGetChildrenCount = async (req, res) => {
    try {
        const count = await getDashboardStats();

        return res.status(200).json({
            status: "success",
            description: "Số lượng trẻ em dưới 16 tuổi hiện đang cư trú",
            data: {
                total: count
            }
        });
    } catch (error) {
        console.error("Controller Error (GetChildrenCount):", error);
        return res.status(500).json({
            message: "Lỗi máy chủ khi thống kê số lượng trẻ em.",
            error: error.message
        });
    }
};