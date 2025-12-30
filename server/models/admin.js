import mssql from 'mssql';

export async function searchNhanKhau(searchTerm){
    try{
        const request = global.sqlPool.request();
        const searchPattern = `%${searchTerm}%`;
        const result = await request
            .input('search', mssql.NVarChar(255),searchPattern)
            .query(`select nk.Ma_CCCD,
                           nk.Ho_Ten,
                           nk.Ngay_Sinh,
                           nk.DC_TT,
                           nd.MA_VT 
                    from Nhan_Khau nk
                    left join Nguoi_Dung nd on nk.Ma_CCCD = nd.Ma_CCCD
                    where (nk.Ma_CCCD like @search or nk.Ho_Ten like @search)
                    and nk.Trang_Thai = N'Đang Sống'
                `)
        return result.recordset;
    }catch(e){
        console.error("Error in searchNhanKhau:",e);
        throw new Error("Failed to search Nhan Khau.");
    }
}


export async function getAllRoles() {
    try{
        const request = global.sqlPool.request();
        const result = await request.query(`
            SELECT Ma_VT, Ten_VT
            FROM Vai_Tro
            WHERE Ma_VT != 1 
        `);
        return result.recordset;
    } catch (err) {
        console.error("Error in getAllRoles:", err);
        throw new Error("Failed to retrieve roles from database.");
    }
    
}
export async function getAllPermissions() {
    try{
        const request = global.sqlPool.request();
        const result = await request.query(`
            SELECT Ma_Quyen, Ten_Quyen
            FROM Quyen`);
        return result.recordset;
    } catch (err) {
        console.error("Error in getAllPermissions:", err);
        throw new Error("Failed to retrieve permissions from database.");
    }
    
}

export async function getPermissionsByRole(maVT) {
    try {
        const request = global.sqlPool.request();
        const result = await request
            .input('maVT', mssql.Int, maVT)
            .query(`
                SELECT q.Ten_Quyen
                FROM Vai_Tro_Quyen vtq
                JOIN Quyen q ON vtq.Ma_Quyen = q.Ma_Quyen
                WHERE vtq.Ma_VT = @maVT
            `);
        return result.recordset.map(r => r.Ten_Quyen);
    } catch (err) {
        console.error("Error in getPermissionsByRole:", err);
        throw new Error("Failed to retrieve role permissions.");
    }
}

export async function assignUserRole(cccd, maVT) {
    const getPool = () => global.sqlPool;
    const pool = getPool();
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        const existingUser = await transaction.request()
            .input('cccd', mssql.VarChar(15), cccd)
            .query(`SELECT Ma_ND FROM Nguoi_Dung WHERE Ma_CCCD = @cccd`);

        if (existingUser.recordset.length > 0) {
            await transaction.request()
                .input('cccd', mssql.VarChar(15), cccd)
                .input('maVT', mssql.Int, maVT)
                .query(`
                    UPDATE Nguoi_Dung 
                    SET Ma_VT = @maVT 
                    WHERE Ma_CCCD = @cccd
                `);
        
        }

        await transaction.commit();
        return true;

    } catch (err) {
        await transaction.rollback();
        console.error("Error in assignUserRole (Transaction rolled back):", err);
        throw new Error("Failed to assign role to user.");
    }
}
export async function removeUserRole(cccd, defaultRoleMaVT = 6) {
     const getPool = () => global.sqlPool;
    const pool = getPool();
    
    try {
        const result = await pool.request()
            .input('cccd', mssql.VarChar(15), cccd)
            .input('defaultRoleMaVT', mssql.Int, defaultRoleMaVT)
            .query(`
                UPDATE Nguoi_Dung 
                SET Ma_VT = @defaultRoleMaVT 
                WHERE Ma_CCCD = @cccd AND Ma_VT != @defaultRoleMaVT
            `);

        return result.rowsAffected[0] > 0; 
    } catch (err) {
        console.error("Error in removeUserRole:", err);
        throw new Error("Failed to remove user role.");
    }
}
export const getAllCanBoUsers = async () => {
    try {
        const pool = global.sqlPool;
        const result = await pool.request()
            .query(`
                SELECT 
                    nd.Ma_CCCD,
                    nk.Ho_Ten,
                    nd.Ma_VT,
                    vt.Ten_VT
                FROM 
                    Nguoi_Dung nd
                JOIN 
                    Nhan_Khau nk ON nd.Ma_CCCD = nk.Ma_CCCD
                JOIN 
                    Vai_Tro vt ON nd.Ma_VT = vt.Ma_VT
                WHERE 
                    nd.Ma_VT >= 2 AND nd.Ma_VT <= 5;
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching all Can Bo users:", error);
        throw error;
    }
};