
import mssql from 'mssql';
export async function createPhanAnh(phanAnhData, files = []) {
    const pool = global.sqlPool;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        const paResult = await transaction.request()
            .input('Tieu_De', mssql.NVarChar(255), phanAnhData.Tieu_De)
            .input('ND_PA', mssql.NVarChar(mssql.MAX), phanAnhData.ND_PA)
            .input('Loai_Van_De', mssql.NVarChar(100), phanAnhData.Loai_Van_De)
            .input('Ma_CCCD', mssql.VarChar(15), phanAnhData.Ma_CCCD)
            .input('Is_An_Danh', mssql.Bit, phanAnhData.Is_An_Danh)
            .query(`
                INSERT INTO Phan_anh (Tieu_De,ND_PA, Loai_Van_De, Ma_CCCD, Ngay_PA, Trang_Thai, Is_An_Danh)
                OUTPUT INSERTED.Ma_PA
                VALUES (@Tieu_De, @ND_PA,@Loai_Van_De, @Ma_CCCD, GETDATE(), N'Chưa Tiếp nhận', @Is_An_Danh)
            `);

        const maPA = paResult.recordset[0].Ma_PA;

        // 2. Chèn danh sách file vào bảng File_PA (nếu có)
        if (files && files.length > 0) {
            for (const file of files) {
                // file: { url: '...', type: 'image' hoặc 'video' }
                await transaction.request()
                    .input('Ma_PA', mssql.Int, maPA)
                    .input('URL_File', mssql.VarChar(mssql.MAX), file.url)
                    .input('Loai_File', mssql.VarChar(10), file.type)
                    .query(`
                        INSERT INTO File_PA (Ma_PA, URL_File, Loai_File)
                        VALUES (@Ma_PA, @URL_File, @Loai_File)
                    `);
            }
        }

        const getAdmins = await transaction.request().query(`
            SELECT Ma_CCCD FROM Nguoi_Dung WHERE Ma_VT IN (2, 3,5)
        `);

        const admins = getAdmins.recordset;
        if (admins.length > 0) {
            const senderName = phanAnhData.Is_An_Danh ? 'Người dân ẩn danh' : phanAnhData.Ho_Ten;
            const tieuDeNoti = 'Phản ánh mới cần xử lý';
            const noiDungNoti = `${senderName} vừa gửi phản ánh mới: "${phanAnhData.Tieu_De}" thuộc lĩnh vực ${phanAnhData.Loai_Van_De}.`;

            for (const admin of admins) {
                await transaction.request()
                    .input('Admin_CCCD', mssql.VarChar(12), admin.Ma_CCCD)
                    .input('Title', mssql.NVarChar, tieuDeNoti)
                    .input('Content', mssql.NVarChar, noiDungNoti)
                    .input('Link', mssql.NVarChar, `/admin/phan-anh/detail/${maPA}`)
                    .query(`
                        INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB, Lien_Ket, Ngay_Tao, Da_Xem)
                        VALUES (@Admin_CCCD, @Title, @Content, N'PhanAnhMoi', @Link, GETDATE(), 0)
                    `);
            }
        }
        await transaction.commit();
        return { success: true, maPA: maPA };

    } catch (err) {
        await transaction.rollback();
        console.error("Error in createPhanAnh:", err);
        throw new Error("Không thể gửi phản ánh. Vui lòng thử lại.");
    }
}

export async function getSummaryPhanAnh() {
    try {
        const pool = global.sqlPool;
        const result = await pool.request().query(`
            SELECT 
                pa.Ma_PA,
                pa.Tieu_De,
                pa.Ngay_PA,
                pa.Loai_Van_De,
                pa.Trang_Thai,
                pa.ND_PA,
                pa.Is_An_Danh,
                CASE WHEN pa.Is_An_Danh = 1 THEN N'Người dùng ẩn danh' ELSE nk.Ho_Ten END AS Nguoi_Gui,
                CASE WHEN pa.Is_An_Danh = 1 THEN 'N/A' ELSE pa.Ma_CCCD END AS Ma_CCCD,
                (SELECT COUNT(*) FROM File_PA f WHERE f.Ma_PA = pa.Ma_PA) AS So_Luong_File,
                (SELECT TOP 1 Ma_PA_Goc FROM Gop_PA g WHERE g.Ma_PA_Duoc_Gop = pa.Ma_PA) AS Bi_Gop_Vao_Ma_PA
            FROM Phan_anh pa
            LEFT JOIN Nhan_Khau nk ON pa.Ma_CCCD = nk.Ma_CCCD
            ORDER BY pa.Ngay_PA DESC
        `);
        const records = result.recordset.map(row => ({
            ...row,
            Files: row.Files_JSON ? JSON.parse(row.Files_JSON) : []
        }));
        return result.recordset;
    } catch (err) {
        console.error("Error in getSummaryPhanAnh:", err);
        throw new Error("Lỗi khi lấy danh sách tổng hợp phản ánh.");
    }
}//hàm này của cán bộ để xử lý phản ánh
export async function getPhanAnhDetail(maPA) {
    try {
        const pool = global.sqlPool;
        
        const result = await pool.request()
            .input('Ma_PA', mssql.Int, maPA)
            .query(`
                SELECT 
                    pa.*, 
                    CASE WHEN pa.Is_An_Danh = 1 THEN N'Người dùng ẩn danh' ELSE nk.Ho_Ten END AS Ten_Nguoi_Gui,
                    CASE WHEN pa.Is_An_Danh = 1 THEN 'N/A' ELSE pa.Ma_CCCD END AS Ma_CCCD_Safe
                    FROM Phan_anh pa
                    JOIN Nhan_Khau nk ON pa.Ma_CCCD = nk.Ma_CCCD
                    WHERE pa.Ma_PA = @Ma_PA;

                SELECT URL_File, Loai_File FROM File_PA WHERE Ma_PA = @Ma_PA;

                SELECT ph.*, nk.Ho_Ten AS Ten_Can_Bo_XL
                FROM Phan_Hoi ph
                JOIN Nhan_Khau nk ON ph.Ma_CCCD_XL = nk.Ma_CCCD
                WHERE ph.Ma_PA = @Ma_PA;
            `);

        return {
            info: result.recordsets[0][0],
            files: result.recordsets[1],
            replies: result.recordsets[2]
        };
    } catch (err) {
        console.error("Error in getPhanAnhDetail:", err);
        throw new Error("Lỗi khi lấy chi tiết phản ánh.");
    }
}// khi người dân ấn vào phản ánh cũ


export async function getMyPhanAnhHistory(maCCCD) {
    try {
        const pool = global.sqlPool;
        const result = await pool.request()
            .input('Ma_CCCD', mssql.VarChar(15), maCCCD)
            .query(`
                SELECT 
                    pa.Ma_PA,
                    pa.Tieu_De,
                    pa.Ngay_PA,
                    pa.Loai_Van_De,
                    pa.ND_PA,
                    pa.Trang_Thai,
                    -- Lấy phản hồi mới nhất từ cán bộ
                    ph.Noi_Dung AS Noi_Dung_Phan_Hoi,
                    ph.Ngay_PH,
                    nk_xl.Ho_Ten AS Ten_Can_Bo_Xu_Ly,
                    -- Đếm số lượng file đính kèm để hiển thị icon icon đính kèm ở UI
                    (SELECT COUNT(*) FROM File_PA f WHERE f.Ma_PA = pa.Ma_PA) AS So_Luong_File
                FROM Phan_anh pa
                LEFT JOIN Phan_Hoi ph ON pa.Ma_PA = ph.Ma_PA
                LEFT JOIN Nhan_Khau nk_xl ON ph.Ma_CCCD_XL = nk_xl.Ma_CCCD
                WHERE pa.Ma_CCCD = @Ma_CCCD
                ORDER BY pa.Ngay_PA DESC
            `);

        return result.recordset;
    } catch (err) {
        console.error("Error in getMyPhanAnhHistory:", err);
        throw new Error("Lỗi khi lấy lịch sử phản ánh.");
    }
}
// thống kê tất cả các loại phản ánh trước đó của 1 người dân
export async function searchPhanAnhComplex(filters) {
    try {
        const pool = global.sqlPool;
        const request = pool.request();
        
        let query = `
            SELECT pa.*,
            CASE 
                    WHEN pa.Is_An_Danh = 1 THEN N'Người dùng ẩn danh' 
                    ELSE nk.Ho_Ten 
                END AS Nguoi_Gui,
                CASE 
                    WHEN pa.Is_An_Danh = 1 THEN 'N/A' 
                    ELSE pa.Ma_CCCD 
                END AS Ma_CCCD_Safe,
            (SELECT STRING_AGG(URL_File + ',' + Loai_File, ';') FROM File_PA f WHERE f.Ma_PA = pa.Ma_PA) AS File_String
            FROM Phan_anh pa
            LEFT JOIN Nhan_Khau nk ON pa.Ma_CCCD = nk.Ma_CCCD
            WHERE 1=1`;

        if (filters.tieuDe) {
            request.input('tieuDe', mssql.NVarChar, `%${filters.tieuDe}%`);
            query += ` AND pa.Tieu_De LIKE @tieuDe`;
        }
        if (filters.loaiVanDe) {
            request.input('loaiVanDe', mssql.NVarChar, filters.loaiVanDe);
            query += ` AND pa.Loai_Van_De = @loaiVanDe`;
        }
        if (filters.trangThai) {
            request.input('trangThai', mssql.NVarChar, filters.trangThai);
            query += ` AND pa.Trang_Thai = @trangThai`;
        }
        if (filters.tuNgay && filters.denNgay) {
            request.input('tuNgay', mssql.Date, filters.tuNgay);
            request.input('denNgay', mssql.Date, filters.denNgay);
            query += ` AND pa.Ngay_PA BETWEEN @tuNgay AND @denNgay`;
        }


        query += ` ORDER BY pa.Ngay_PA DESC`;
        const result = await request.query(query);

        const records = result.recordset.map(row => {
            let fileList = [];
            if (row.File_String) {
                // Tách chuỗi: "url1,image;url2,video" -> [{url: 'url1', type: 'image'}, ...]
                fileList = row.File_String.split(';').map(item => {
                    const [url, type] = item.split(',');
                    return { URL_File: url, Loai_File: type };
                });
            }
            return {
                ...row,
                Files: fileList
            };
        });

        return records;
    } catch (err) {
        throw new Error("Lỗi khi tìm kiếm phản ánh: " + err.message);
    }
}

//  Hàm xử lý/tiếp nhận phản ánh
export async function processPhanAnh(maPA, trangThaiMoi, noiDungPH, maCCCDCanBo) {
    const pool = global.sqlPool;
    const transaction = new mssql.Transaction(pool);
    try {
        await transaction.begin();

        await transaction.request()
            .input('maPA', mssql.Int, maPA)
            .input('trangThai', mssql.NVarChar, trangThaiMoi)
            .query(`UPDATE Phan_anh SET Trang_Thai = @trangThai WHERE Ma_PA = @maPA`);

        if (trangThaiMoi === 'Đã xử lý') {
            if (!noiDungPH) throw new Error("Cần nội dung phản hồi khi hoàn thành xử lý.");
            
            await transaction.request()
                .input('maPA', mssql.Int, maPA)
                .input('noiDung', mssql.NVarChar, noiDungPH)
                .input('maCB', mssql.VarChar, maCCCDCanBo)
                .query(`
                    INSERT INTO Phan_Hoi (Ma_PA, Ngay_PH, Noi_Dung, Ma_CCCD_XL)
                    VALUES (@maPA, GETDATE(), @noiDung, @maCB)
                `);
        }
        const paInfo = await transaction.request()
            .input('paID', mssql.Int, maPA)
            .query(`SELECT Ma_CCCD, Tieu_De FROM Phan_Anh WHERE Ma_PA = @paID`);

        if (paInfo.recordset.length > 0) {
            const { Ma_CCCD, Tieu_De } = paInfo.recordset[0];
            let tieuDeNoti = "";
            let noiDungNoti = "";

            if (trangThaiMoi === 'Đang xử lý' || trangThaiMoi === 'Đã tiếp nhận') {
                tieuDeNoti = 'Phản ánh của bạn đã được tiếp nhận';
                noiDungNoti = `Phản ánh "${Tieu_De}" của bạn đã được cán bộ tiếp nhận và đang trong quá trình xử lý.`;
            } else if (trangThaiMoi === 'Đã xử lý') {
                tieuDeNoti = 'Kết quả xử lý phản ánh';
                noiDungNoti = `Phản ánh "${Tieu_De}" của bạn đã hoàn tất xử lý. Nội dung phản hồi: ${noiDungPH}`;
            }

            if (tieuDeNoti) {
                await transaction.request()
                    .input('nguoiNhan', mssql.VarChar(12), Ma_CCCD)
                    .input('title', mssql.NVarChar, tieuDeNoti)
                    .input('content', mssql.NVarChar, noiDungNoti)
                    .input('link', mssql.NVarChar, `/phan-anh/detail/${maPA}`)
                    .query(`
                        INSERT INTO Thong_Bao (Ma_CCCD_NguoiNhan, Tieu_De, Noi_Dung, Loai_TB, Lien_Ket, Ngay_Tao, Da_Xem)
                        VALUES (@nguoiNhan, @title, @content, N'PhanAnhUpdate', @link, GETDATE(), 0)
                    `);
            }
        }

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

export async function deletePhanAnhByResident(maPA, maCCCD) {
    const pool = global.sqlPool;
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Kiểm tra xem phản ánh có tồn tại, thuộc về người dùng này và chưa được xử lý không
        const checkResult = await transaction.request()
            .input('Ma_PA', mssql.Int, maPA)
            .input('Ma_CCCD', mssql.VarChar(15), maCCCD)
            .query(`
                SELECT Trang_Thai FROM Phan_anh 
                WHERE Ma_PA = @Ma_PA AND Ma_CCCD = @Ma_CCCD
            `);

        if (checkResult.recordset.length === 0) {
            throw new Error("Phản ánh không tồn tại hoặc bạn không có quyền xóa.");
        }

        const status = checkResult.recordset[0].Trang_Thai;
        if (status !== 'Chưa Tiếp nhận') {
            throw new Error("Không thể xóa phản ánh đã được tiếp nhận hoặc xử lý.");
        }

        // 2. Xóa các file đính kèm trước (Ràng buộc khóa ngoại)
        await transaction.request()
            .input('Ma_PA', mssql.Int, maPA)
            .query(`DELETE FROM File_PA WHERE Ma_PA = @Ma_PA`);

        // 3. Xóa phản ánh chính
        await transaction.request()
            .input('Ma_PA', mssql.Int, maPA)
            .query(`DELETE FROM Phan_anh WHERE Ma_PA = @Ma_PA`);

        await transaction.commit();
        return { success: true };
    } catch (err) {
        await transaction.rollback();
        console.error("Error in deletePhanAnhByResident:", err);
        throw err;
    }
}
export async function getPhanAnhStatistics() {
    try {
        const pool = global.sqlPool;
        const result = await pool.request().query(`
            SELECT 
                COUNT(CASE WHEN Trang_Thai = N'Chưa Tiếp nhận' THEN 1 END) AS ChuaTiepNhan,
                COUNT(CASE WHEN Trang_Thai = N'Đã Tiếp nhận' THEN 1 END) AS DaTiepNhan,
                COUNT(CASE WHEN Trang_Thai = N'Đã xử lý' THEN 1 END) AS DaXuLy,
                COUNT(*) AS TongSo
            FROM Phan_anh
            WHERE Ngay_PA >= DATEADD(month, -3, GETDATE())
        `);
        
        return result.recordset[0];
    } catch (err) {
        console.error("Error in getPhanAnhStatistics:", err);
        throw new Error("Lỗi khi thống kê phản ánh.");
    }
}

