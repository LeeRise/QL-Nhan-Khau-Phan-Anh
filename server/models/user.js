import mssql from 'mssql';
import bcrypt from 'bcrypt'

export const findUserByCCCD = async(cccd)=>{
    try{
        const request = global.sqlPool.request();
        const result = await request
              .input('cccd',mssql.VarChar(15),cccd)
              .query(`SELECT u.Ma_ND, n.Email, u.Mat_Khau, u.Ma_CCCD,u.Ma_VT 
                FROM Nguoi_Dung u
                INNER JOIN Nhan_Khau n ON u.Ma_CCCD = n.Ma_CCCD
                WHERE u.Ma_CCCD = @cccd`);
        if(result.recordset.length === 0) {return null}
        const user = result.recordset[0];

        const quyenResult = await global.sqlPool.request()
               .input('maVT',mssql.Int, user.Ma_VT)
               .query(`select q.Ten_Quyen
                from Vai_Tro_Quyen vtq
                 join Quyen q on vtq.Ma_Quyen = q.Ma_Quyen
                 where vtq.Ma_VT = @maVT`)
        user.quyen = quyenResult.recordset.map(r=> r.Ten_Quyen);
        return user;
    }
    catch (e){
        console.error("Error find user by cccd:",e);
        throw new Error('Database query failed.');
    }
}
export async function findAdminByUsername (ten_dn) {
    try{
        const request =  global.sqlPool.request();
        const result = await request
                .input('ten_dn', mssql.VarChar(50),ten_dn)
                .query(`select Ma_ND, Mat_Khau, Ma_VT
                    from Nguoi_Dung
                    Where Ten_DN = @ten_dn and Ma_VT =1`)
        return result.recordset.length>0 ? result.recordset[0]: null;
    }
    catch(e){
        console.error("Error find Admin By UserName:",e);
        throw new Error("Database query failed.");
    }
}
export async function updatePassword(cccd, newPass) {
    try{const hashedPass = await bcrypt.hash(newPass, 10);

    const request = global.sqlPool.request();
    const result = await request
            .input('cccd', mssql.VarChar(15),cccd)
            .input('hashedPass',mssql.VarChar(255), hashedPass)
            .query(`update Nguoi_Dung
                set Mat_Khau = @hashedPass
                where Ma_CCCD = @cccd`);
    return result.rowsAffected[0]>0;
} catch(e){
    console.error("Error in updatePass:",e);
    throw new Error("Password update failed.")
}}

export async function createOrUpdateOTP(cccd, otp, expiryTime) {
    try {
        const pool = global.sqlPool;
        
        const request = pool.request();
        
        request
            .input('cccd', mssql.VarChar(15), cccd)
            .input('otp', mssql.VarChar(6), otp)
            .input('expiryTime', mssql.DateTime, expiryTime);

        await request.query(`DELETE FROM Temp_Auth WHERE Ma_CCCD = @cccd`);
        const result = await request.query(`
            INSERT INTO Temp_Auth (Ma_CCCD, OTP_Code, OTP_Expiry)
            VALUES (@cccd, @otp, @expiryTime)
        `);
            
        return result.rowsAffected[0] > 0;
    } catch (e) {
        console.error("Error in create or update OTP:", e);
        throw new Error("OTP save failed.");
    }
}
export async function getOTPDetails(cccd){
    try{
        const request= global.sqlPool.request();
        const result = await request
              .input('cccd', mssql.VarChar(15),cccd)
              .query(`Select OTP_Code, OTP_Expiry
                from Temp_Auth
                where Ma_CCCD = @cccd
            `)
        return result.recordset.length>0 ? result.recordset[0]:null;
    }catch(e){
        console.error("Error in get OTP Details:",e);
        throw new Error("Get OTP failed.")
    }
}

export async function deleteOTP(cccd){
    try{
        const request = global.sqlPool.request();
        await request
            .input('cccd',mssql.VarChar(15),cccd)
            .query(`
                delete from Temp_Auth
                Where Ma_CCCD = @cccd`)
    }catch(e){
        console.error("Error in delete Otp:",e);

    }
}

export async function verifyNhanKhau(data){
    try{
        const request = global.sqlPool.request();
        let whereClauses = [];
        if(!data.cccd ){
            throw new Error("CCCD is required for verification.");
        }
        request.input('cccd', mssql.VarChar(15), data.cccd);
        whereClauses.push("nk.Ma_CCCD = @cccd");
        if (data.email) {
            request.input('email', mssql.VarChar(100), data.email);
            whereClauses.push("nk.Email = @email");
        }
        if (data.hoTen) {
            request.input('hoTen', mssql.NVarChar(255), data.hoTen);
            whereClauses.push("nk.Ho_Ten = @hoTen");
        }
        if (data.ngaySinh) {
            request.input('ngaySinh', mssql.Date, data.ngaySinh);
            whereClauses.push("nk.Ngay_Sinh = @ngaySinh");
        }
        if (data.ngayCap) {
            request.input('ngayCap', mssql.Date, data.ngayCap);
            whereClauses.push("nk.Ngay_Cap_CC = @ngayCap");
        }
        const whereString = whereClauses.join(' AND ');
        const query = `
            SELECT nk.Ma_CCCD 
            FROM Nhan_Khau nk
            WHERE ${whereString}
        `;
        const result = await request.query(query);
        
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }
    catch (err) {
        console.error("Error in verifyNhanKhauInfo:", err);
        throw new Error("Database verification failed.");
    }
}

export async function checkUserExistence(maNd) {
    try {
        const request = global.sqlPool.request();
        const result = await request
            .input('maNd', mssql.Int, maNd)
            .query(`
                SELECT 1
                FROM Nguoi_Dung nd
                WHERE nd.Ma_ND = @maNd
            `);
        
        return result.recordset.length > 0;
    } catch (e) {
        console.error("Error checking user existence:", e);
        throw new Error("Failed to check user existence in database."); 
    }
}