import mssql from 'mssql'
export const getPersonalProfile = async (cccd) => {
    try {
        const request = global.sqlPool.request();
        const result = await request
            .input('cccd', mssql.VarChar(12), cccd)
            .query(`
                SELECT *
                FROM Nhan_Khau
                WHERE Ma_CCCD = @cccd
            `);
        
        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (e) {
        console.error("Error in getPersonalProfile:", e);
        throw new Error("Lấy thông tin cá nhân thất bại.");
    }
};
export const getHouseholdDetails = async (cccd) => {
    try {
        const request = global.sqlPool.request();
        
        const hkResult = await request
            .input('cccd', mssql.VarChar(12), cccd)
            .query(`
                SELECT hk.Ma_HK, hk.Dia_Chi, hk.CCCD_Chu_Ho, nk.Ho_Ten as Ten_Chu_Ho
                FROM Ho_Khau hk
                JOIN Nhan_Khau nk ON hk.CCCD_Chu_Ho = nk.Ma_CCCD
                WHERE hk.Ma_HK = (SELECT Ma_HK FROM Nhan_Khau WHERE Ma_CCCD = @cccd)
            `);

        if (hkResult.recordset.length === 0) return null;

        const householdInfo = hkResult.recordset[0];

        const membersResult = await global.sqlPool.request()
            .input('maHK', mssql.Int, householdInfo.Ma_HK)
            .query(`
                SELECT lk.Ma_CCCD, nk.Ho_Ten, lk.Quan_He
                FROM lien_ket_HK lk
                JOIN Nhan_Khau nk ON lk.Ma_CCCD = nk.Ma_CCCD
                WHERE lk.Ma_HK = @maHK
            `);

        return {
            info: householdInfo,
            members: membersResult.recordset
        };
    } catch (e) {
        console.error("Error in getHouseholdDetails:", e);
        throw new Error("Lấy thông tin hộ khẩu thất bại.");
    }
};