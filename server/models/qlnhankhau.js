import mssql from 'mssql'
//hàm tìm kiếm hộ khẩu và thành viên trong hộ khẩu
export const searchHouseholdMembers = async ({ HotenChuHo, cccdChuHo, maHK }) => {
    try {
        const request = global.sqlPool.request();
        let queryCondition = "";

        if (maHK) {
            request.input('maHK', mssql.Int, maHK);
            queryCondition = "hk.Ma_HK = @maHK";
        } else if (cccdChuHo) {
            request.input('cccdChuHo', mssql.VarChar(12), cccdChuHo);
            queryCondition = "hk.CCCD_Chu_Ho = @cccdChuHo";
        } else if (HotenChuHo) {
            request.input('HotenChuHo', mssql.NVarChar(mssql.MAX), `%${HotenChuHo}%`);
            queryCondition = "nk_chuho.Ho_Ten LIKE @HotenChuHo";
        } else {
            throw new Error("Vui lòng cung cấp ít nhất một thông tin tìm kiếm.");
        }

        const query = `
            SELECT 
                hk.Ma_HK,
                hk.Dia_Chi,
                nk_chuho.Ho_Ten AS Ten_Chu_Ho,
                nk_chuho.Ma_CCCD AS CCCD_Chu_Ho,
                -- Lấy cụ thể các cột từ nk_tv để tránh trùng Ma_HK dẫn đến bị Array [1,1]
                nk_tv.Ma_NK,
                nk_tv.Ho_Ten,
                nk_tv.Bi_Danh,
                nk_tv.Ngay_Sinh,
                nk_tv.Gioi_Tinh,
                nk_tv.Noi_Sinh,
                nk_tv.Que_Quan,
                nk_tv.Dan_Toc,
                nk_tv.Ma_CCCD,
                nk_tv.Ngay_Cap_CC,
                nk_tv.Noi_Cap,
                nk_tv.DC_TT,
                nk_tv.DC_Thuong_Tru_Truoc,
                nk_tv.Email,
                nk_tv.Nghe_Nghiep,
                nk_tv.Noi_Lam_Viec,
                nk_tv.Trang_Thai,
                nk_tv.Ho_Ten AS Ho_Ten_Thanh_Vien,
                nk_tv.Ma_CCCD AS CCCD_Thanh_Vien,
                lk.Quan_He
            FROM Ho_Khau hk
            JOIN Nhan_Khau nk_chuho ON hk.CCCD_Chu_Ho = nk_chuho.Ma_CCCD
            JOIN lien_ket_HK lk ON hk.Ma_HK = lk.Ma_HK
            JOIN Nhan_Khau nk_tv ON lk.Ma_CCCD = nk_tv.Ma_CCCD
            WHERE ${queryCondition}
            ORDER BY hk.Ma_HK, CASE WHEN lk.Quan_He = N'Chủ hộ' THEN 0 ELSE 1 END;
        `;

        const result = await request.query(query);
        return result.recordset;
    } catch (e) {
        console.error("Error in searchHouseholdMembers:", e);
        throw new Error("Lỗi khi tìm kiếm thành viên hộ gia đình: " + e.message);
    }
};

// Hàm tách hộ khẩu 
export const splitHousehold = async ({ MaHKCu, MaCCCD_ChuHoMoi, DiaChiMoi, DanhSachThanhVien }) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);

        const resOldAddress = await request
            .input('MaHKCu', mssql.Int, MaHKCu)
            .query(`SELECT Dia_Chi, CCCD_Chu_Ho as cccdChuHoCu FROM Ho_Khau WHERE Ma_HK = @MaHKCu`);
        
        const diaChiCu = resOldAddress.recordset[0]?.Dia_Chi || 'Không xác định';
        const cccdChuHoCu = resOldAddress.recordset[0].cccdChuHoCu;
        const resHK = await request
            .input('DiaChiMoi', mssql.NVarChar, DiaChiMoi)
            .input('ChuHoMoi', mssql.VarChar, MaCCCD_ChuHoMoi)
            .query(`INSERT INTO Ho_Khau (Dia_Chi, Ngay_lap, CCCD_Chu_Ho, Tinh_Trang) 
                    OUTPUT INSERTED.Ma_HK
                    VALUES (@DiaChiMoi, GETDATE(), @ChuHoMoi, N'Tồn tại')`);
        
        const maHKMoi = resHK.recordset[0].Ma_HK;

        for (const member of DanhSachThanhVien) {
            const { cccd, quanHe } = member;
            const subRequest = new mssql.Request(transaction);
            await subRequest
                .input('cccd', mssql.VarChar, cccd)
                .input('maHKMoi', mssql.Int, maHKMoi)
                .input('quanHe', mssql.NVarChar, quanHe)
                .input('maHKCu', mssql.Int, MaHKCu)
                .input('diaChiCu', mssql.NVarChar, diaChiCu)
                .input('diaChiMoi', mssql.NVarChar, DiaChiMoi)
                .query(`
                    -- Xóa liên kết cũ
                    DELETE FROM lien_ket_HK WHERE Ma_CCCD = @cccd;
                    -- Cập nhật Ma_HK trong Nhan_Khau
                    UPDATE Nhan_Khau SET Ma_HK = @maHKMoi,DC_TT = @diaChiCu,DC_Thuong_Tru_Truoc = @diaChiMoi WHERE Ma_CCCD = @cccd;
                    -- Thêm liên kết mới
                    INSERT INTO lien_ket_HK (Ma_HK, Ma_CCCD, Quan_He) VALUES (@maHKMoi, @cccd, @quanHe);
                    -- Ghi nhận biến động
                    INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK,Ma_HK_Cu, Ngay_Thuc_Hien, Ghi_Chu,DC_Cu, DC_Moi)
                    SELECT N'Tách hộ', Ma_NK, @maHKMoi,@maHKCu, GETDATE(), N'Tách từ hộ cũ Ma_HK: ' + CAST(${MaHKCu} AS NVARCHAR),
                    @diaChiCu,@diaChiMoi
                    FROM Nhan_Khau WHERE Ma_CCCD = @cccd;
                `);
        }

        const notiRequest = new mssql.Request(transaction);
        await notiRequest
            .input('cccdOldMaster', mssql.VarChar, cccdChuHoCu)
            .input('msg', mssql.NVarChar, `Có thành viên vừa tách khỏi hộ khẩu của bạn để sang địa chỉ mới: ${DiaChiMoi}`)
            .query(`INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB) 
                    VALUES (@cccdOldMaster, N'Biến động hộ khẩu', @msg, N'HoKhau')`);
        await transaction.commit();
        return { success: true, maHKMoi };
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};
// Thêm nhân khẩu mới 
export const addMember = async (memberData) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);
        let currentCCCD = memberData.maCCCD ? memberData.maCCCD.trim() : null;

        // 1. Kiểm tra tồn tại
        
        if (!currentCCCD) {
    currentCCCD = 'T' + Math.random().toString().slice(2, 13);
}       const checkRes = await request
            .input('maCCCD_check', mssql.VarChar(12), currentCCCD)
            .query(`SELECT Ma_NK FROM Nhan_Khau WHERE Ma_CCCD = @maCCCD_check`); 
        let maNK;
        const isExisting = checkRes.recordset.length > 0;
        const loaiBD = isExisting ? 'Nhập hộ (người cũ)' : 'Thêm nhân khẩu mới';

        // 2. Thiết lập tất cả input cho bảng Nhan_Khau
        request
            .input('maCCCD', mssql.VarChar(12), currentCCCD)
            .input('maHK', mssql.Int, memberData.maHK)
            .input('hoTen', mssql.NVarChar, memberData.hoTen)
            .input('ngaySinh', mssql.Date, memberData.ngaySinh)
            .input('ngayCap', mssql.Date, memberData.ngayCap || null)
            .input('noiCap', mssql.NVarChar, memberData.noiCap || null)
            .input('dcTT', mssql.NVarChar, memberData.dcTT)
            .input('gioiTinh', mssql.NVarChar, memberData.gioiTinh)
            .input('email', mssql.VarChar(100), memberData.email || null)
            .input('queQuan', mssql.NVarChar, memberData.queQuan || null)
            .input('noiSinh', mssql.NVarChar, memberData.noiSinh || null)
            .input('ttHonNhan', mssql.NVarChar, memberData.ttHonNhan || null)
            .input('biDanh', mssql.NVarChar, memberData.biDanh || null)
            .input('ngheNghiep', mssql.NVarChar, memberData.ngheNghiep || null)
            .input('danToc', mssql.NVarChar, memberData.danToc)
            .input('ngayDK', mssql.Date, memberData.ngayDK || new Date())
            .input('dcTruoc', mssql.NVarChar, memberData.dcThuongTruTruoc || null)
            .input('noiLamViec', mssql.NVarChar, memberData.noiLamViec || null);

        if (isExisting) {
            maNK = checkRes.recordset[0].Ma_NK;
            await request.input('maNK_fixed', mssql.Int, maNK).query(`
                UPDATE Nhan_Khau SET 
                    Ma_HK = @maHK, Ho_Ten = @hoTen, Ngay_Sinh = @ngaySinh, 
                    Ngay_Cap_CC = @ngayCap, Noi_Cap = @noiCap, DC_TT = @dcTT, 
                    Gioi_Tinh = @gioiTinh, Email = @email, Que_Quan = @queQuan, 
                    Noi_Sinh = @noiSinh, TT_Hon_Nhan = @ttHonNhan, Bi_Danh = @biDanh, 
                    Nghe_Nghiep = @ngheNghiep, Dan_Toc = @danToc, 
                    Ngay_DK_Thuong_Tru = @ngayDK, DC_Thuong_Tru_Truoc = @dcTruoc, 
                    Noi_Lam_Viec = @noiLamViec, Trang_Thai = N'Đang sống'
                WHERE Ma_NK = @maNK_fixed
            `);
        } else {
            const resInsert = await request.query(`
                INSERT INTO Nhan_Khau (
                    Ma_CCCD, Ma_HK, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap, 
                    DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh, 
                    TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Dan_Toc, 
                    Ngay_DK_Thuong_Tru, DC_Thuong_Tru_Truoc, Noi_Lam_Viec, Trang_Thai
                ) VALUES (
                    @maCCCD, @maHK, @hoTen, @ngaySinh, @ngayCap, @noiCap, 
                    @dcTT, @gioiTinh, @email, @queQuan, @noiSinh, 
                    @ttHonNhan, @biDanh, @ngheNghiep, @danToc, 
                    @ngayDK, @dcTruoc, @noiLamViec, N'Đang sống'
                );
                SELECT SCOPE_IDENTITY() AS Ma_NK;
            `);
            maNK = resInsert.recordset[0].Ma_NK;
            const resCCCD = await new mssql.Request(transaction)
                .input('newMaNK', mssql.Int, maNK)
                .query(`SELECT Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = @newMaNK`);
            currentCCCD = resCCCD.recordset[0].Ma_CCCD;
        }

        // 3. Xử lý liên kết (Quan trọng: tạo Request mới để tránh trùng lặp input cũ)
        const reqLink = new mssql.Request(transaction);
        await reqLink
            .input('maCCCD', mssql.VarChar(12), currentCCCD)
            .input('maHK', mssql.Int, memberData.maHK)
            .input('quanHe', mssql.NVarChar, memberData.quanHe || 'Thành viên')
            .query(`
                DELETE FROM lien_ket_HK WHERE Ma_CCCD = @maCCCD;
                INSERT INTO lien_ket_HK (Ma_HK, Ma_CCCD, Quan_He) VALUES (@maHK, @maCCCD, @quanHe);
            `);

        // 4. Biến động (Phải input @maNK vào ĐÚNG request này)
        const reqHistory = new mssql.Request(transaction);
        await reqHistory
            .input('loaiBD', mssql.NVarChar, loaiBD)
            .input('maNK', mssql.Int, maNK)
            .input('maHK', mssql.Int, memberData.maHK)
            .input('ghiChu', mssql.NVarChar, memberData.ghiChu || 'Cập nhật nhân khẩu')
            .input('dcTruoc', mssql.NVarChar, memberData.dcThuongTruTruoc || null)
            .input('dcTT', mssql.NVarChar, memberData.dcTT)
            .query(`
                INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, Ghi_Chu, DC_Cu, DC_Moi)
                VALUES (@loaiBD, @maNK, @maHK, GETDATE(), @ghiChu, @dcTruoc, @dcTT)
            `);
        const reqNoti = new mssql.Request(transaction);
        const resHK = await reqNoti
            .input('maHK_Noti', mssql.Int, memberData.maHK)
            .query(`SELECT CCCD_Chu_Ho, Dia_Chi FROM Ho_Khau WHERE Ma_HK = @maHK_Noti`);

        if (resHK.recordset.length > 0) {
            const chuHo = resHK.recordset[0];
            if (chuHo.CCCD_Chu_Ho !== currentCCCD) {
                await reqNoti
                    .input('cccdChuHo', mssql.VarChar(12), chuHo.CCCD_Chu_Ho)
                    .input('tieuDe', mssql.NVarChar, 'Biến động nhân khẩu trong hộ')
                    .input('noiDung', mssql.NVarChar, `Hộ khẩu tại ${chuHo.Dia_Chi} vừa tiếp nhận thành viên mới: ${memberData.hoTen}.`)
                    .input('loaiTB', mssql.NVarChar, 'HoKhau')
                    .query(`
                        INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB, Ngay_Tao, Da_Xem)
                        VALUES (@cccdChuHo, @tieuDe, @noiDung, @loaiTB, GETDATE(), 0)
                    `);
            }
        }

        await transaction.commit();
        return { success: true, maCCCD: currentCCCD, maNK: maNK };

    } catch (e) {
        if (e.precedingErrors && e.precedingErrors.length > 0) {
        console.error("SQL SERVER ERROR DETAILS:", e.precedingErrors);
    } else {
        console.error("ACTUAL ERROR:", e);
    }

    if (transaction) {
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            // Không cần quan tâm lỗi rollback nếu transaction đã bị aborted
        }
    }
    throw e;
    }
};
// kiểm tra trong hộ chưa

export const checkMemberStatusBeforeAdd = async ({ maCCCD, hoTen, ngaySinh, queQuan }) => {
    try {
        const request = new mssql.Request(global.sqlPool);
        let query = `
            SELECT 
                Ma_NK,Ma_CCCD, Ma_HK, Ho_Ten, Trang_Thai, DC_TT,
                Dan_Toc, Ngay_Sinh, Gioi_Tinh, Que_Quan, Bi_Danh,
                Ngay_Cap_CC, Noi_Cap, Noi_Sinh, Email, Nghe_Nghiep,
                Noi_Lam_Viec, TT_Hon_Nhan
            FROM Nhan_Khau 
            WHERE 1=1
        `;

        if (maCCCD) {
            request.input('cccd', mssql.VarChar(15), maCCCD);
            query += ` AND Ma_CCCD = @cccd`;
        } else if (hoTen && ngaySinh && queQuan) {
            request.input('hoTen', mssql.NVarChar(100), hoTen);
            request.input('ngaySinh', mssql.Date, ngaySinh);
            request.input('queQuan', mssql.NVarChar(255), queQuan);
            
            query += ` AND Ho_Ten = @hoTen AND Ngay_Sinh = @ngaySinh AND Que_Quan = @queQuan`;
        } else {
            return { 
                allowed: false, 
                message: "Vui lòng nhập số CCCD hoặc đầy đủ Họ tên, Ngày sinh, Quê quán." 
            };
        }

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            const member = result.recordset[0];
            
            if (member.Trang_Thai === 'Đang sống' && member.Ma_HK !== null) {
                return { 
                    allowed: false, 
                    message: "Không thể thêm thành viên này vì đang nằm trong hộ khẩu khác.",
                    data: member 
                };
            }

            return { allowed: true, exists: true, data: member };
        }

        return { allowed: true, exists: false, data: {} };

    } catch (error) {
        console.error("Error in checkMemberStatus Model:", error);
        throw error;
    }
};
//hàm tạm trú / tạm vắng

export const registerResidenceChange = async (data) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);

        

        let maNK;
        let maHK_Goc;
        let currentStatus = '';
        let effectiveCCCD = data.cccd;
        if (!effectiveCCCD || effectiveCCCD.trim() === '') {
            effectiveCCCD = 'T' + Math.random().toString().slice(2, 13);
        }
        const checkNK = await request
            .input('cccdCheck', mssql.VarChar(12), effectiveCCCD)
            .query(`SELECT Ma_NK, Ma_HK, Trang_Thai, DC_TT FROM Nhan_Khau WHERE Ma_CCCD = @cccdCheck`);

        if (checkNK.recordset.length === 0) {
            // TRƯỜNG HỢP 1: CHƯA CÓ TRÊN HỆ THỐNG -> INSERT MỚI
            const queryInsertNK = `
                INSERT INTO Nhan_Khau (
                    Ma_CCCD, Ma_HK, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap, 
                    DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh, 
                    TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Dan_Toc, 
                    Ngay_DK_Thuong_Tru, DC_Thuong_Tru_Truoc, Noi_Lam_Viec, Trang_Thai
                ) 
                
                VALUES (
                    @cccd, @maHK, @hoTen, @ngaySinh, @ngayCap, @noiCap, 
                    @dcTT, @gioiTinh, @email, @queQuan, @noiSinh, 
                    @ttHonNhan, @biDanh, @ngheNghiep, @danToc, 
                    @ngayDK, @dcTruoc, @noiLamViec, N'Tạm Trú'
                );
                SELECT SCOPE_IDENTITY() AS Ma_NK;
            `;

            const resNK = await new mssql.Request(transaction)
                .input('cccd', mssql.VarChar(12), effectiveCCCD)
                .input('maHK', mssql.Int, data.maHK_ThuongTru || null)
                .input('hoTen', mssql.NVarChar, data.hoTen)
                .input('ngaySinh', mssql.Date, data.ngaySinh)
                .input('ngayCap', mssql.Date, data.ngayCap || null)
                .input('noiCap', mssql.NVarChar, data.noiCap || null)
                .input('dcTT', mssql.NVarChar, data.dcTT)
                .input('gioiTinh', mssql.NVarChar, data.gioiTinh)
                .input('email', mssql.VarChar(100), data.email || null)
                .input('queQuan', mssql.NVarChar, data.queQuan || null)
                .input('noiSinh', mssql.NVarChar, data.noiSinh || null)
                .input('ttHonNhan', mssql.NVarChar, data.ttHonNhan || null)
                .input('biDanh', mssql.NVarChar, data.biDanh || null)
                .input('ngheNghiep', mssql.NVarChar, data.ngheNghiep || null)
                .input('danToc', mssql.NVarChar, data.danToc || 'Kinh')
                .input('ngayDK', mssql.Date, data.ngayDK || null)
                .input('dcTruoc', mssql.NVarChar, data.dcThuongTruTruoc || null)
                .input('noiLamViec', mssql.NVarChar, data.noiLamViec || null)
                .query(queryInsertNK);
            
            maNK = resNK.recordset[0].Ma_NK;
            const resActual = await new mssql.Request(transaction)
                .input('id', mssql.Int, maNK)
                .query(`SELECT Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = @id`);
            effectiveCCCD = resActual.recordset[0].Ma_CCCD.toString().trim();
            maHK_Goc = data.maHK_ThuongTru;
            currentStatus = 'Mới';
        } else {
            // TRƯỜNG HỢP 2: ĐÃ CÓ -> CẬP NHẬT THÔNG TIN CƠ BẢN
            const person = checkNK.recordset[0];
            maNK = person.Ma_NK;
            maHK_Goc = person.Ma_HK;
            currentStatus = person.Trang_Thai;

            await new mssql.Request(transaction)
                .input('u_maNK', mssql.Int, maNK)
                .input('u_hoTen', mssql.NVarChar, data.hoTen)
                .input('u_dcTT', mssql.NVarChar, data.dcTT)
                .input('u_email', mssql.VarChar(100), data.email || null)
                .input('u_ngheNghiep', mssql.NVarChar, data.ngheNghiep || null)
                .input('u_noiLamViec', mssql.NVarChar, data.noiLamViec || null)
                .input('u_ttHonNhan', mssql.NVarChar, data.ttHonNhan || null)
                .query(`
                    UPDATE Nhan_Khau 
                    SET Ho_Ten = @u_hoTen, Email = @u_email, Nghe_Nghiep = @u_ngheNghiep, DC_TT = @u_dcTT,
                        Noi_Lam_Viec = @u_noiLamViec, TT_Hon_Nhan = @u_ttHonNhan
                    WHERE Ma_NK = @u_maNK
                `);
        }

        // --- XỬ LÝ LOGIC TẠM TRÚ / TẠM VẮNG ---

        if (data.loaiHinh === 'Tạm trú') {
            // 1. Kiểm tra điều kiện Tạm trú (Phải Tạm vắng hoặc đang Tạm trú ở đâu đó)
            if (currentStatus === 'Đang sống' && maHK_Goc) {
                throw new Error("Người này chưa đăng ký Tạm vắng tại nơi thường trú.");
            }

            let targetMaHK_TamTru = data.maHK;

            // 2. Nếu không có mã hộ, tạo hộ khẩu tạm trú mới
            if (!targetMaHK_TamTru) {
                const resHK = await new mssql.Request(transaction)
                    .input('diaChiMoi', mssql.NVarChar, data.noiDenDi)
                    .input('ngayLapHK', mssql.Date, data.tuNgay)
                    .input('cccd_hk', mssql.VarChar(12), effectiveCCCD)
                    .query(`
                        INSERT INTO Ho_Khau (Dia_Chi, Ngay_lap, Tinh_Trang, CCCD_Chu_Ho)
                        OUTPUT INSERTED.Ma_HK
                        VALUES (@diaChiMoi, @ngayLapHK, N'Tạm trú',@cccd_hk)
                    `);
                targetMaHK_TamTru = resHK.recordset[0].Ma_HK;
            } else {
                // Kiểm tra mã hộ truyền vào có tồn tại không
                const checkHKExists = await new mssql.Request(transaction)
                    .input('hkId', mssql.Int, targetMaHK_TamTru)
                    .query(`SELECT 1 FROM Ho_Khau WHERE Ma_HK = @hkId`);
                if (checkHKExists.recordset.length === 0) throw new Error("Mã hộ khẩu tạm trú không tồn tại.");
                if (targetMaHK_TamTru == maHK_Goc) throw new Error("Hộ tạm trú không được trùng với hộ gốc.");
            }

            // 3. Cập nhật trạng thái phức hợp vào Nhan_Khau
            const complexStatus = `Tạm trú hộ ${targetMaHK_TamTru} - Gốc hộ ${maHK_Goc || 'N/A'}`;
            await new mssql.Request(transaction)
                .input('cStatus', mssql.NVarChar, complexStatus)
                .input('targetNK', mssql.Int, maNK)
                .input('t_maHK', mssql.Int, targetMaHK_TamTru)
                .query(`UPDATE Nhan_Khau SET Trang_Thai = @cStatus,Ma_HK = @t_maHK WHERE Ma_NK = @targetNK`);

            // 4. Cập nhật hoặc Thêm mới vào lien_ket_HK
            const reqLink = new mssql.Request(transaction);
            await reqLink
    .input('lHK', mssql.Int, targetMaHK_TamTru)
    .input('targetMaNK', mssql.Int, maNK) // Dùng Ma_NK làm vật trung gian (Khóa chính Int không bao giờ thay đổi)
    .input('lQuanHe', mssql.NVarChar, data.quanHe || 'Tạm trú')
    .query(`
        -- Khai báo biến để lấy CCCD trực tiếp trong SQL
        DECLARE @RealCCCD VARCHAR(12);
        SELECT @RealCCCD = Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = @targetMaNK;

        IF @RealCCCD IS NOT NULL
        BEGIN
            -- Xóa liên kết cũ của CCCD này (nếu có)
            DELETE FROM lien_ket_HK WHERE Ma_CCCD = @RealCCCD;
            
            -- Chèn liên kết mới vào hộ tạm trú
            INSERT INTO lien_ket_HK (Ma_HK, Ma_CCCD, Quan_He) 
            VALUES (@lHK, @RealCCCD, @lQuanHe);
        END
    `);

            // 5. Ghi biến động
            await new mssql.Request(transaction)
                .input('bd_NK', mssql.Int, maNK)
                .input('bd_HK', mssql.Int, targetMaHK_TamTru)
                .input('bd_HK_Cu', mssql.Int, maHK_Goc || null)
                .input('bd_Tu', mssql.Date, data.tuNgay)
                .input('bd_Den', mssql.Date, data.denNgay)
                .input('bd_NoiDen', mssql.NVarChar, data.noiDenDi)
                .input('bd_dcCu', mssql.NVarChar, data.dcTT)
                .input('bd_LyDo', mssql.NVarChar, data.lyDo)
                .query(`
                    INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ma_HK_Cu, Ngay_Thuc_Hien, Ngay_Ket_Thuc, DC_Moi, Ghi_Chu, DC_Cu)
                    VALUES (N'Tạm trú', @bd_NK, @bd_HK, @bd_HK_Cu, @bd_Tu, @bd_Den, @bd_NoiDen, @bd_LyDo,@bd_dcCu)
                `);
            if (targetMaHK_TamTru) {
                const reqNoti = new mssql.Request(transaction);
                const resHK = await reqNoti
                    .input('targetHK', mssql.Int, targetMaHK_TamTru)
                    .query(`SELECT CCCD_Chu_Ho, Dia_Chi FROM Ho_Khau WHERE Ma_HK = @targetHK`);

                if (resHK.recordset.length > 0) {
                    const chuHo = resHK.recordset[0];
                    if (chuHo.CCCD_Chu_Ho !== effectiveCCCD) {
                        await reqNoti
                            .input('nhan', mssql.VarChar(12), chuHo.CCCD_Chu_Ho)
                            .input('tieude', mssql.NVarChar, 'Thông báo tạm trú mới')
                            .input('noidung', mssql.NVarChar, `Công dân ${data.hoTen} đã đăng ký tạm trú vào hộ của bạn tại ${chuHo.Dia_Chi}.`)
                            .query(`INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB) 
                                    VALUES (@nhan, @tieude, @noidung, N'TamTru')`);
                    }
                }
            }    

        } else if (data.loaiHinh === 'Tạm vắng') {
            // Cập nhật trạng thái thành Tạm vắng
            await new mssql.Request(transaction)
                .input('v_NK', mssql.Int, maNK)
                .input('v_Tu', mssql.Date, data.tuNgay)
                .input('v_Den', mssql.Date, data.denNgay)
                .input('v_GhiChu', mssql.NVarChar, data.lyDo)
                .input('v_NoiDen', mssql.NVarChar, data.noiDenDi)
                .input('v_dcCu', mssql.NVarChar, data.dcTT)
                .query(`
                    UPDATE Nhan_Khau SET Trang_Thai = N'Tạm vắng' WHERE Ma_NK = @v_NK;

                    INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, Ngay_Ket_Thuc, DC_Moi, Ghi_Chu,DC_Cu)
                    SELECT N'Tạm vắng', @v_NK, Ma_HK, @v_Tu, @v_Den, @v_NoiDen, @v_GhiChu,@v_dcCu
                    FROM Nhan_Khau WHERE Ma_NK = @v_NK
                `);
                if (maHK_Goc) {
                const reqNotiVang = new mssql.Request(transaction);
                const resHKGoc = await reqNotiVang
                    .input('gocHK', mssql.Int, maHK_Goc)
                    .query(`SELECT CCCD_Chu_Ho FROM Ho_Khau WHERE Ma_HK = @gocHK`);

                if (resHKGoc.recordset.length > 0) {
                    const chuHoGoc = resHKGoc.recordset[0];
                    if (chuHoGoc.CCCD_Chu_Ho !== effectiveCCCD) {
                        await reqNotiVang
                            .input('nhanGoc', mssql.VarChar(12), chuHoGoc.CCCD_Chu_Ho)
                            .input('tieudeVang', mssql.NVarChar, 'Thông báo thành viên tạm vắng')
                            .input('noidungVang', mssql.NVarChar, `Thành viên ${data.hoTen} trong hộ đã đăng ký tạm vắng từ ngày ${new Date(data.tuNgay).toLocaleDateString('vi-VN')}.`)
                            .query(`INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB) 
                                    VALUES (@nhanGoc, @tieudeVang, @noidungVang, N'TamVang')`);
                    }
                }
            }
        } 

        // 6. GHI VÀO QUẢN LÝ CƯ TRÚ (Lịch sử chi tiết)
        await new mssql.Request(transaction)
            .input('targetMaNK', mssql.Int, maNK) // Dùng Ma_NK
    .input('ct_Loai', mssql.NVarChar, data.loaiHinh)
    .input('ct_Tu', mssql.Date, data.tuNgay)
    .input('ct_Den', mssql.Date, data.denNgay)
    .input('ct_Noi', mssql.NVarChar, data.noiDenDi)
    .input('ct_LyDo', mssql.NVarChar, data.lyDo)
    .input('ct_dcCu', mssql.NVarChar, data.dcTT)
    .query(`
        DECLARE @FinalCCCD VARCHAR(12);
        SELECT @FinalCCCD = Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = @targetMaNK;

        IF @FinalCCCD IS NOT NULL
        BEGIN
            INSERT INTO Quan_Ly_Cu_Tru (Ma_CCCD, Loai_Hinh, Tu_Ngay, Den_Ngay, Noi_Den_Di, Ly_Do, DC_Den_Di)
            VALUES (@FinalCCCD, @ct_Loai, @ct_Tu, @ct_Den, @ct_Noi, @ct_LyDo, @ct_dcCu);
        END
    `);

        await transaction.commit();
        return { success: true, maNK };
    } catch (e) {
        if (transaction) await transaction.rollback();
        console.error("Lỗi đăng ký cư trú:", e.message);
        throw e;
    }
};
// kiểm tra trước khi tạm trú tạm vắng
export const checkMemberStatusBeforeAdd1 = async (searchParams) => {
    const { maCCCD, hoTen, ngaySinh, queQuan } = searchParams;
    try {
        const request = new mssql.Request(global.sqlPool);
        let query = `
            SELECT 
                Ma_NK, Ma_HK, Ho_Ten, Trang_Thai, DC_TT,
                Dan_Toc, Ngay_Sinh, Gioi_Tinh, Que_Quan, Bi_Danh,
                Ngay_Cap_CC, Noi_Cap, Noi_Sinh, Email, Nghe_Nghiep,
                Noi_Lam_Viec, TT_Hon_Nhan, Ma_CCCD
            FROM Nhan_Khau 
            WHERE 1=1
        `;

        if (maCCCD) {
            request.input('cccd', mssql.VarChar(15), maCCCD);
            query += ` AND Ma_CCCD = @cccd`;
        } 
        else if (hoTen && ngaySinh && queQuan) {
            request.input('hoTen', mssql.NVarChar(100), hoTen);
            request.input('ngaySinh', mssql.Date, ngaySinh);
            request.input('queQuan', mssql.NVarChar(255), queQuan);
            
            query += ` AND Ho_Ten = @hoTen AND Ngay_Sinh = @ngaySinh AND Que_Quan = @queQuan`;
        } else {
            return { allowed: false, message: "Thiếu thông tin tra cứu" };
        }

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            const member = result.recordset[0];
            return { 
                allowed: true, 
                exists: true, 
                hasHauKhau: !!member.Ma_HK, 
                data: member 
            };
        }

        return { allowed: true, exists: false, hasHauKhau: false, data: {} };
        
    } catch (error) {
        console.error("Error in checkMemberStatus Model:", error);
        throw error;
    }
};
// hàm chuyển đi hoặc qua đời
export const handleMemberDeparture = async (data) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();

        // 1. Kiểm tra nhân khẩu và lấy thông tin địa chỉ cũ
        const checkRequest = new mssql.Request(transaction);
        const checkRole = await checkRequest
            .input('cccdIn', mssql.VarChar(12), data.cccd)
            .input('mHK', mssql.Int, data.maHK)
            .query(`
                SELECT nk.Ma_NK, nk.Ho_Ten, hk.CCCD_Chu_Ho, hk.Dia_Chi
                FROM Nhan_Khau nk
                JOIN Ho_Khau hk ON nk.Ma_HK = hk.Ma_HK
                WHERE nk.Ma_CCCD = @cccdIn AND nk.Ma_HK = @mHK
            `);

        if (checkRole.recordset.length === 0) {
            throw new Error("Không tìm thấy nhân khẩu trong hộ khẩu này.");
        }

        const person = checkRole.recordset[0];
        const diaChiCu = person.Dia_Chi;
        const isOwner = (person.CCCD_Chu_Ho === data.cccd);
        const newStatus = (data.lyDo === 'Đã qua đời') ? 'Đã qua đời' : 'Chuyển đi';
        const loaiBienDong = (newStatus === 'Đã qua đời') ? 'Xóa nhân khẩu (Khai tử)' : 'Chuyển đi';

        // 2. Kiểm tra số lượng người còn lại TRONG HỘ
        const countRequest = new mssql.Request(transaction);
        const countRes = await countRequest
            .input('mHK', mssql.Int, data.maHK)
            .query(`SELECT COUNT(*) as total FROM lien_ket_HK WHERE Ma_HK = @mHK`);
        
        const isLastMember = countRes.recordset[0].total === 1;

        let recipientCCCD = null;
        let notificationContent = "";
        let notificationTitle = "Biến động hộ khẩu";

        // 3. Xử lý logic Chủ hộ
        if (isOwner) {
            if (isLastMember) {
                // Nếu là người cuối cùng và là chủ hộ -> Cập nhật Hộ khẩu thành Đã chuyển đi
                const updateHK = new mssql.Request(transaction);
                await updateHK
                    .input('mHK', mssql.Int, data.maHK)
                    .query(`UPDATE Ho_Khau SET Tinh_Trang = N'Đã chuyển đi', CCCD_Chu_Ho = NULL WHERE Ma_HK = @mHK`);

            } else {
                // Nếu còn người khác mà không có dữ liệu chủ mới -> Báo lỗi
                if (!data.cccdChuHoMoi || !data.danhSachQuanHeMoi) {
                    throw new Error("Chủ hộ đi cần chỉ định Chủ hộ mới và cập nhật lại quan hệ các thành viên.");
                }

                // Cập nhật chủ hộ mới
                const ownerRequest = new mssql.Request(transaction);
                await ownerRequest
                    .input('newOwner', mssql.VarChar(12), data.cccdChuHoMoi)
                    .input('mHK', mssql.Int, data.maHK)
                    .query(`UPDATE Ho_Khau SET CCCD_Chu_Ho = @newOwner WHERE Ma_HK = @mHK`);

                recipientCCCD = data.cccdChuHoMoi;
                notificationTitle = "Thay đổi vai trò Chủ hộ + Biến động hộ khẩu";
                notificationContent = `Bạn đã được chỉ định làm Chủ hộ mới cho hộ khẩu tại ${person.Dia_Chi} sau khi chủ hộ cũ (${person.Ho_Ten}) ${newStatus.toLowerCase()}.`;
                // Cập nhật quan hệ các thành viên còn lại
                for (const member of data.danhSachQuanHeMoi) {
                    const relRequest = new mssql.Request(transaction);
                    await relRequest
                        .input('mHK', mssql.Int, data.maHK)
                        .input('memCCCD', mssql.VarChar(12), member.cccd)
                        .input('newRel', mssql.NVarChar, member.quanHe)
                        .query(`UPDATE lien_ket_HK SET Quan_He = @newRel WHERE Ma_HK = @mHK AND Ma_CCCD = @memCCCD`);
                }
            }
        } else if (isLastMember) {
            const updateHK = new mssql.Request(transaction);
            await updateHK
                .input('mHK', mssql.Int, data.maHK)
                .query(`UPDATE Ho_Khau SET Tinh_Trang = N'Đã chuyển đi', CCCD_Chu_Ho = NULL WHERE Ma_HK = @mHK`);
        }
        else {
            recipientCCCD = person.CCCD_Chu_Ho;
            notificationContent = `Thành viên ${person.Ho_Ten} đã được xóa khỏi hộ khẩu của bạn do ${newStatus.toLowerCase()}.`;
        }

        // 4. Ghi lịch sử biến động
        const historyRequest = new mssql.Request(transaction);
        await historyRequest
            .input('loaiBD', mssql.NVarChar, loaiBienDong)
            .input('mNK', mssql.Int, person.Ma_NK)
            .input('mHK', mssql.Int, data.maHK)
            .input('ngayDi', mssql.Date, data.ngayThucHien)
            .input('dcMoi', mssql.NVarChar, data.noiDen || null)
            .input('ghiChu', mssql.NVarChar, data.lyDo)
            .input('dcCu', mssql.NVarChar, diaChiCu)
            .query(`
                INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, DC_Moi, Ghi_Chu, DC_Cu)
                VALUES (@loaiBD, @mNK, @mHK, @ngayDi, @dcMoi, @ghiChu, @dcCu)
            `);

        // 5. Cập nhật nhân khẩu và Xóa liên kết
        const finalRequest = new mssql.Request(transaction);
        await finalRequest
            .input('newStatus', mssql.NVarChar, newStatus)
            .input('mNK', mssql.Int, person.Ma_NK)
            .input('mHK', mssql.Int, data.maHK)
            .input('cccdIn', mssql.VarChar(12), data.cccd)
            .query(`
                UPDATE Nhan_Khau SET Trang_Thai = CASE
                WHEN Trang_Thai LIKE N'%Tạm trú%' AND @newStatus <> N'Đã qua đời'
                THEN N'Tạm trú chuyển đi'
                WHEN Trang_Thai LIKE N'%Tạm trú%' AND @newStatus = N'Đã qua đời'
                THEN N'Tạm trú, Qua đời'
                ELSE @newStatus
                END,
                Ma_HK = NULL WHERE Ma_NK = @mNK;
                DELETE FROM lien_ket_HK WHERE Ma_HK = @mHK AND Ma_CCCD = @cccdIn;
            `);

        if (recipientCCCD && recipientCCCD !== data.cccd) {
            const notiRequest = new mssql.Request(transaction);
            await notiRequest
                .input('recep', mssql.VarChar(12), recipientCCCD)
                .input('title', mssql.NVarChar, notificationTitle)
                .input('content', mssql.NVarChar, notificationContent)
                .input('type', mssql.NVarChar, 'BienDong')
                .query(`
                    INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB, Ngay_Tao, Da_Xem)
                    VALUES (@recep, @title, @content, @type, GETDATE(), 0)
                `);
        }
        
        await transaction.commit();
        return { success: true, message: `Đã xử lý ${newStatus} thành công.` };
    } catch (e) {
        if (transaction) await transaction.rollback();
        console.error("Lỗi Model handleMemberDeparture:", e.message);
        throw e;
    }
};
// hàm sửa đổi thông tin cá nhân và đã có hàm thông tin cá nhân ở nhân khẩu
export const updatePersonInfo = async (data) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);

        const query = `
            UPDATE Nhan_Khau
            SET 
                Ho_Ten = @hoTen,
                Ngay_Sinh = @ngaySinh,
                Ngay_Cap_CC = @ngayCap,
                Noi_Cap = @noiCap,
                DC_TT = @dcTT,
                Gioi_Tinh = @gioiTinh,
                Email = @email,
                Que_Quan = @queQuan,
                Noi_Sinh = @noiSinh,
                TT_Hon_Nhan = @ttHonNhan,
                Bi_Danh = @biDanh,
                Nghe_Nghiep = @ngheNghiep,
                Dan_Toc = @danToc,
                Ngay_DK_Thuong_Tru = @ngayDK,
                DC_Thuong_Tru_Truoc = @dcTruoc,
                Noi_Lam_Viec = @noiLamViec
            WHERE Ma_CCCD = @cccd
        `;

        await request
            .input('cccd', mssql.VarChar(12), data.Ma_CCCD)
            .input('hoTen', mssql.NVarChar, data.Ho_Ten)
            .input('ngaySinh', mssql.Date, data.Ngay_Sinh)
            .input('ngayCap', mssql.Date, data.Ngay_Cap_CC || null)
            .input('noiCap', mssql.NVarChar, data.Noi_Cap || null)
            .input('dcTT', mssql.NVarChar, data.DC_TT || null)
            .input('gioiTinh', mssql.NVarChar, data.Gioi_Tinh)
            .input('email', mssql.VarChar(100), data.Email || null)
            .input('queQuan', mssql.NVarChar, data.Que_Quan || null)
            .input('noiSinh', mssql.NVarChar, data.Noi_Sinh || null)
            .input('ttHonNhan', mssql.NVarChar, data.TT_Hon_Nhan || null)
            .input('biDanh', mssql.NVarChar, data.Bi_Danh || null)
            .input('ngheNghiep', mssql.NVarChar, data.Nghe_Nghiep || null)
            .input('danToc', mssql.NVarChar, data.Dan_Toc || null)
            .input('ngayDK', mssql.Date, data.Ngay_DK_Thuong_Tru || null)
            .input('dcTruoc', mssql.NVarChar, data.DC_Thuong_Tru_Truoc || null)
            .input('noiLamViec', mssql.NVarChar, data.Noi_Lam_Viec || null)
            .query(query);
        const notiRequest = new mssql.Request(transaction);
        const tieuDe = 'Thông tin cá nhân đã được cập nhật';
        const noiDung = `Chào ${data.Ho_Ten}, thông tin nhân khẩu của bạn đã được cán bộ quản lý cập nhật trên hệ thống vào lúc ${new Date().toLocaleString('vi-VN')}. Vui lòng kiểm tra lại.`;

        await notiRequest
            .input('nguoiNhan', mssql.VarChar(12), data.Ma_CCCD)
            .input('tieuDe', mssql.NVarChar, tieuDe)
            .input('noiDung', mssql.NVarChar, noiDung)
            .input('loaiTB', mssql.NVarChar, 'CapNhatThongTin')
            .input('lienKet', mssql.NVarChar, '/profile') // Đường dẫn tới trang thông tin cá nhân của người dùng
            .query(`
                INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB, Lien_Ket, Ngay_Tao, Da_Xem)
                VALUES (@nguoiNhan, @tieuDe, @noiDung, @loaiTB, @lienKet, GETDATE(), 0)
            `);

        await transaction.commit();
        return { success: true, message: "Cập nhật thông tin thành công" };
    } catch (error) {
        await transaction.rollback();
        console.error("Lỗi khi cập nhật nhân khẩu:", error);
        throw error;
    }
};
// hàm đăng kí hộ khẩu mới 
export const registerNewHousehold = async (data) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);

        
        const resHK = await request
            .input('diaChi', mssql.NVarChar, data.diaChi)
            .input('ngayLap', mssql.Date, data.ngayLap || new Date())
            .query(`
                INSERT INTO Ho_Khau (Dia_Chi, Ngay_lap, CCCD_Chu_Ho, Tinh_Trang)
                OUTPUT INSERTED.Ma_HK
                VALUES (@diaChi, @ngayLap, NULL, N'Tồn tại')
            `);

        const maHK = resHK.recordset[0].Ma_HK;

        for (const member of data.members) {
            const mReq = new mssql.Request(transaction);
            let memberCCCD = member.cccd;
            if (!memberCCCD || memberCCCD.trim() === '') {
                memberCCCD = 'T' + Math.random().toString().slice(2, 13);
            }
            mReq.input('maCCCD', mssql.VarChar(12), memberCCCD);
            

            const checkExist = await mReq.query(`SELECT Ma_NK FROM Nhan_Khau WHERE Ma_CCCD = @maCCCD`);
            
            let maNK;
            const isExisting = checkExist.recordset.length > 0;

            mReq.input('maHK', mssql.Int, maHK)
                .input('hoTen', mssql.NVarChar, member.hoTen)
                .input('ngaySinh', mssql.Date, member.ngaySinh)
                .input('ngayCap', mssql.Date, member.ngayCap || null)
                .input('noiCap', mssql.NVarChar, member.noiCap || null)
                .input('dcTT', mssql.NVarChar, member.dcTT || data.diaChi)
                .input('gioiTinh', mssql.NVarChar, member.gioiTinh)
                .input('email', mssql.VarChar(100), member.email || null)
                .input('queQuan', mssql.NVarChar, member.queQuan || null)
                .input('noiSinh', mssql.NVarChar, member.noiSinh || null)
                .input('ttHonNhan', mssql.NVarChar, member.ttHonNhan || null)
                .input('biDanh', mssql.NVarChar, member.biDanh || null)
                .input('ngheNghiep', mssql.NVarChar, member.ngheNghiep || null)
                .input('danToc', mssql.NVarChar, member.danToc)
                .input('ngayDK', mssql.Date, member.ngayDKThuongTru || data.ngayLap)
                .input('dcTruoc', mssql.NVarChar, member.dcThuongTruTruoc || null)
                .input('noiLamViec', mssql.NVarChar, member.noiLamViec || null);

            if (isExisting) {
                maNK = checkExist.recordset[0].Ma_NK;
                await mReq.input('maNK_old', mssql.Int, maNK).query(`
                    UPDATE Nhan_Khau SET 
                        Ma_HK = @maHK, Ho_Ten = @hoTen, Ngay_Sinh = @ngaySinh, 
                        Ngay_Cap_CC = @ngayCap, Noi_Cap = @noiCap, DC_TT = @dcTT, 
                        Gioi_Tinh = @gioiTinh, Email = @email, Que_Quan = @queQuan, 
                        Noi_Sinh = @noiSinh, TT_Hon_Nhan = @ttHonNhan, Bi_Danh = @biDanh, 
                        Nghe_Nghiep = @ngheNghiep, Dan_Toc = @danToc, 
                        Ngay_DK_Thuong_Tru = @ngayDK, DC_Thuong_Tru_Truoc = @dcTruoc, 
                        Noi_Lam_Viec = @noiLamViec, Trang_Thai = N'Đang sống'
                    WHERE Ma_NK = @maNK_old
                `);
            } else {
                const resInsert = await mReq.query(`
                    INSERT INTO Nhan_Khau (
                        Ma_CCCD, Ma_HK, Ho_Ten, Ngay_Sinh, Ngay_Cap_CC, Noi_Cap, 
                        DC_TT, Gioi_Tinh, Email, Que_Quan, Noi_Sinh, 
                        TT_Hon_Nhan, Bi_Danh, Nghe_Nghiep, Dan_Toc, 
                        Ngay_DK_Thuong_Tru, DC_Thuong_Tru_Truoc, Noi_Lam_Viec, Trang_Thai
                    ) VALUES (
                        @maCCCD, @maHK, @hoTen, @ngaySinh, @ngayCap, @noiCap, 
                        @dcTT, @gioiTinh, @email, @queQuan, @noiSinh, 
                        @ttHonNhan, @biDanh, @ngheNghiep, @danToc, 
                        @ngayDK, @dcTruoc, @noiLamViec, N'Đang sống'
                    );
                    SELECT SCOPE_IDENTITY() AS Ma_NK;
                `);
                maNK = resInsert.recordset[0].Ma_NK;
                const resActual = await new mssql.Request(transaction)
                    .input('id', mssql.Int, maNK)
                    .query(`SELECT Ma_CCCD FROM Nhan_Khau WHERE Ma_NK = @id`);
                memberCCCD = resActual.recordset[0].Ma_CCCD;

            }


            const linkReq = new mssql.Request(transaction);
            await linkReq.input('cccd', mssql.VarChar(12), memberCCCD)
                       .input('maHK', mssql.Int, maHK)
                       .input('quanHe', mssql.NVarChar, member.quanHe || 'Thành viên')
                       .query(`
                            DELETE FROM lien_ket_HK WHERE Ma_CCCD = @cccd;
                            INSERT INTO lien_ket_HK (Ma_HK, Ma_CCCD, Quan_He) VALUES (@maHK, @cccd, @quanHe);
                       `);

            // 4. Ghi biến động
            const histReq = new mssql.Request(transaction);
            await histReq.input('maNK', mssql.Int, maNK)
                        .input('maHK', mssql.Int, maHK)
                        .input('loai', mssql.NVarChar, isExisting ? 'Nhập hộ (người cũ)' : 'Đăng ký thường trú')
                        .input('ghiChu', mssql.NVarChar, member.cccd === data.cccdChuHo ? 'Chủ hộ' : 'Thành viên')
                        .input('dcCu', mssql.NVarChar, member.dcThuongTruTruoc || null)
                        .input('dcTT', mssql.NVarChar, member.dcTT || data.diaChi)
                        .query(`
                            INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, DC_Cu, Ghi_Chu,DC_Moi)
                            VALUES (@loai, @maNK, @maHK, GETDATE(), @dcCu, @ghiChu,@dcTT)
                        `);
        }

        await request.input('maHK_final', mssql.Int, maHK)
                    .input('cccdCH', mssql.VarChar(12), data.cccdChuHo)
                    .query(`UPDATE Ho_Khau SET CCCD_Chu_Ho = @cccdCH WHERE Ma_HK = @maHK_final`);

        await transaction.commit();
        return { success: true, maHK: maHK };
    } catch (err) {
        if (transaction) await transaction.rollback();
        throw err;
    }
};
// hàm chuyển đi cả hộ
export const moveEntireHousehold = async (data) => {
    const transaction = new mssql.Transaction(global.sqlPool);
    try {
        await transaction.begin();
        const request = new mssql.Request(transaction);

        let whereClause = "";
        if (data.maHK) {
            whereClause = "hk.Ma_HK = @searchValue";
            request.input('searchValue', mssql.Int, data.maHK);
        } else if (data.cccdChuHo) {
            whereClause = "hk.CCCD_Chu_Ho = @searchValue";
            request.input('searchValue', mssql.NVarChar, data.cccdChuHo);
        } else if (data.hoTenChuHo) {
            whereClause = "nk.Ho_Ten LIKE @searchValue AND lk.Quan_He = N'Chủ hộ'";
            request.input('searchValue', mssql.NVarChar, `%${data.hoTenChuHo}%`);
        } else {
            throw new Error("Cần cung cấp Mã HK, CCCD hoặc Họ tên chủ hộ.");
        }
        const listMembers = await request
            .query(`SELECT nk.Ma_NK, hk.Dia_Chi, hk.Ma_HK
            FROM Nhan_Khau nk
            JOIN Ho_Khau hk ON nk.Ma_HK = hk.Ma_HK
            JOIN lien_ket_HK lk ON nk.Ma_CCCD = lk.Ma_CCCD
            WHERE ${whereClause} AND nk.Trang_Thai = N'Đang sống'`);

        if (listMembers.recordset.length === 0) {
            throw new Error("Hộ khẩu không có nhân khẩu nào đang cư trú hoặc mã hộ không tồn tại.");
        }

        const targetMaHK = listMembers.recordset[0].Ma_HK;
        const diaChiCu = listMembers.recordset[0].Dia_Chi;
        const memberIds = listMembers.recordset.map(row => row.Ma_NK);

        request.input('mHK', mssql.Int, targetMaHK);
        request.input('ngayChuyen', mssql.Date, data.ngayChuyen);
        await request
            .input('ngayChuyen', mssql.Date, data.ngayChuyen)
            .query(`
                UPDATE Ho_Khau 
                SET Tinh_Trang = N'Đã chuyển đi' 
                WHERE Ma_HK = @mHK
            `);

        await request.query(`
            UPDATE Nhan_Khau 
            SET Trang_Thai = CASE 
                WHEN Trang_Thai LIKE N'%Tạm trú%' THEN N'Tạm trú chuyển đi'
                ELSE N'Chuyển đi'
            END,
            Ma_HK = NULL
            WHERE Ma_HK = @mHK
        `);

        await request.query(`DELETE FROM lien_ket_HK WHERE Ma_HK = @mHK`);
        for (const maNK of memberIds) {
            const bdReq = new mssql.Request(transaction);
            await bdReq
                .input('mNK', mssql.Int, maNK)
                .input('mHK', mssql.Int, targetMaHK)
                .input('ngayTH', mssql.Date, data.ngayChuyen)
                .input('dcCu', mssql.NVarChar, diaChiCu)
                .input('dcMoi', mssql.NVarChar, data.noiDen)
                .input('ghiChu', mssql.NVarChar, data.lyDo)
                .query(`
                    INSERT INTO Bien_Dong_HK (Loai_Bien_Dong, Ma_NK, Ma_HK, Ngay_Thuc_Hien, DC_Moi,DC_Cu, Ghi_Chu)
                    VALUES (N'Chuyển đi cả hộ', @mNK, @mHK, @ngayTH, @dcMoi,@dcCu, @ghiChu)
                `);
        }

        await transaction.commit();
        return { success: true, message: `Đã chuyển đi cả hộ thành công cho ${memberIds.length} nhân khẩu.` };
    } catch (err) {
        await transaction.rollback();
        console.error("Lỗi khi chuyển đi cả hộ:", err.message);
        throw err;
    }
};
// hàm ghi nhận biến động hộ khẩu 1 hộ
export const getHouseholdHistory = async (maHK) => {
    try {
        const request = new mssql.Request(global.sqlPool);
        const query = `
            SELECT 
                bd.Ngay_Thuc_Hien, bd.Loai_Bien_Dong, bd.Ghi_Chu,
                nk.Ho_Ten, nk.Ma_CCCD, bd.DC_Cu, bd.DC_Moi, bd.Ma_HK_Cu, bd.Ngay_Ket_Thuc
            FROM Bien_Dong_HK bd
            JOIN Nhan_Khau nk ON bd.Ma_NK = nk.Ma_NK
            WHERE bd.Ma_HK = @maHK or bd.Ma_HK_Cu = @maHK
            ORDER BY bd.Ngay_Thuc_Hien DESC
        `;
        const result = await request
            .input('maHK', mssql.Int, maHK)
            .query(query);
        return result.recordset;
    } catch (err) {
        throw err;
    }
};
// thống kê
export const searchPopulation = async (filters = {}) => {
    try {
        const pool = await global.sqlPool;
        const request = pool.request();
        let whereConditions = [];

        if (filters.tuoiTu !== undefined && filters.tuoiTu !== '') {
            request.input('tuoiTu', filters.tuoiTu);
            whereConditions.push("DATEDIFF(YEAR, Ngay_Sinh, GETDATE()) >= @tuoiTu");
        }
        if (filters.tuoiDen !== undefined && filters.tuoiDen !== '') {
            request.input('tuoiDen', filters.tuoiDen);
            whereConditions.push("DATEDIFF(YEAR, Ngay_Sinh, GETDATE()) <= @tuoiDen");
        }
        if (filters.ngayDKThuongTru!==undefined && filters.ngayDKThuongTru !=='') {
            request.input('ngayDKThuongTru', filters.ngayDKThuongTru);
            whereConditions.push("CAST(Ngay_DK_Thuong_Tru AS DATE) = CAST(@ngayDKThuongTru AS DATE)");
        }
        const textFilters = {
            hoTen: "(Ho_Ten LIKE @hoTen OR Bi_Danh LIKE @hoTen)",
            noiLamViec: "Noi_Lam_Viec LIKE @noiLamViec",
            dcTT: "DC_TT LIKE @dcTT",
            queQuan: "Que_Quan LIKE @queQuan",
            dcTTTruoc: "DC_Thuong_Tru_Truoc LIKE @dcTTTruoc",
            ngheNghiep: "Nghe_Nghiep LIKE @ngheNghiep",
            noiSinh: "Noi_Sinh LIKE @noiSinh",
            trangThai: "Trang_Thai like @trangThai",
            ttHonNhan: "TT_Hon_Nhan like @ttHonNhan",
        };

        for (const [key, sqlCondition] of Object.entries(textFilters)) {
            if (filters[key] && filters[key] !== 'undefined' && filters[key].toString().trim() !== '') {
                request.input(key, `%${filters[key]}%`);
                whereConditions.push(sqlCondition);
            }
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT 
                Ma_CCCD, 
                Ho_Ten, 
                Ngay_Sinh, 
                DC_TT,
                Gioi_Tinh,
                Nghe_Nghiep,
                DATEDIFF(YEAR, Ngay_Sinh, GETDATE()) as Tuoi,
                Trang_Thai,
                TT_Hon_Nhan,
                Ngay_Dk_Thuong_Tru
            FROM Nhan_Khau 
            ${whereClause}
            ORDER BY Ho_Ten ASC
        `;

        const result = await request.query(query);
        return result.recordset; 
    } catch (err) {
        console.error("Lỗi khi tìm kiếm danh sách dân cư:", err.message);
        throw err;
    }
};
// thống kê tạm trú tạm vắng
export const getResidenceFluctuationStats = async (data) => {
    try {
        const request = new mssql.Request(global.sqlPool);
        
        request.input('start', mssql.Date, data.startDate);
        request.input('end', mssql.Date, data.endDate);
        request.input('loai', mssql.NVarChar, data.loai);

        let loaiCondition = `(bd.Loai_Bien_Dong = N'Tạm trú' OR bd.Loai_Bien_Dong = N'Tạm vắng')`;
        if (data.loai && data.loai !== 'Tất cả') {
            loaiCondition = `bd.Loai_Bien_Dong = @loai`;
        }

        const query = `
            SELECT 
                bd.Loai_Bien_Dong,
                bd.Ngay_Thuc_Hien,
                bd.Ngay_Ket_Thuc,
                bd.DC_Moi as Dia_Chi_Bien_Dong,
                bd.Ghi_Chu,
                nk.Ma_CCCD,
                nk.Ho_Ten,
                nk.Email,
                nk.Ngay_Sinh,
                nk.Gioi_Tinh
            FROM Bien_Dong_HK bd
            INNER JOIN Nhan_Khau nk ON bd.Ma_NK = nk.Ma_NK
            WHERE ${loaiCondition}
              AND bd.Ngay_Thuc_Hien >= @start 
              AND bd.Ngay_Thuc_Hien <= @end
            ORDER BY bd.Ngay_Thuc_Hien DESC
        `;

        const result = await request.query(query);
        const resData = result.recordset;
        
        return {
            danhSachKetQua: resData,
            count: resData.length,
            thongTinLoc: {
                tuNgay: data.startDate,
                denNgay: data.endDate,
                loai: data.loai || 'Tất cả'
            }
        };
    } catch (err) {
        console.error("Lỗi tại getResidenceFluctuationStats model:", err.message);
        throw err;
    }
};
export const getDashboardStats = async () => {
    try {
        const pool = await global.sqlPool; 
        const request = new mssql.Request(pool);
        
        const result = await request.query(`
            SELECT COUNT(*) AS totalHoKhau FROM Ho_Khau WHERE Tinh_Trang = N'Tồn tại';

            SELECT COUNT(*) AS totalDanThuongTru FROM Nhan_Khau WHERE Trang_Thai = N'Đang sống';

            SELECT COUNT(DISTINCT Ma_NK) AS totalTamTru 
            FROM Nhan_Khau
            WHERE Trang_Thai Like N'Tạm trú hộ%';

            SELECT COUNT(DISTINCT Ma_NK) AS totalTamVang 
            FROM Nhan_Khau
            WHERE Trang_Thai = N'Tạm vắng';

            SELECT COUNT(*) AS totalChildren 
            FROM Nhan_Khau 
            WHERE DATEDIFF(YEAR, Ngay_Sinh, GETDATE()) < 16 
              AND (Trang_Thai = N'Đang sống' OR Trang_Thai LIKE N'Tạm trú chuyển đi%');
        `);

        return {
            totalHoKhau: result.recordsets[0][0].totalHoKhau,
            totalDanThuongTru: result.recordsets[1][0].totalDanThuongTru,
            totalTamTru: result.recordsets[2][0].totalTamTru,
            totalTamVang: result.recordsets[3][0].totalTamVang,
            totalChildren: result.recordsets[4][0].totalChildren,
            totalPopulation: (result.recordsets[1][0].totalDanThuongTru + result.recordsets[2][0].totalTamTru) 
        };
    } catch (err) {
        console.error("Lỗi khi lấy thống kê dashboard:", err.message);
        throw err;
    }
};