import 'dotenv/config';
import mssql from 'mssql';
import bcrypt from 'bcrypt';

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function addAdminUser() {
    try {
        const pool = await mssql.connect(dbConfig);
        console.log('Connected to database');

        // Hash the password
        const password = 'admin123'; // Change this to your desired password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user (assuming Ma_VT=1 is admin, and you have a CCCD in Nhan_Khau)
        // Replace 'admin_cccd' with an actual CCCD from Nhan_Khau table
        const request = pool.request();
        await request
            .input('ten_dn', mssql.VarChar(50), 'admin') // Username
            .input('mat_khau', mssql.VarChar(255), hashedPassword)
            .input('ma_cccd', mssql.VarChar(15), 'admin_cccd') // Replace with real CCCD
            .input('ma_vt', mssql.Int, 1) // Admin role
            .query(`
                INSERT INTO Nguoi_Dung (Ten_DN, Mat_Khau, Ma_CCCD, Ma_VT)
                VALUES (@ten_dn, @mat_khau, @ma_cccd, @ma_vt)
            `);

        console.log('Admin user added successfully!');
        console.log('Username: admin');
        console.log('Password: admin123'); // Remember to change this

        await pool.close();
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

addAdminUser();