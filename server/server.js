import 'dotenv/config';

import express from 'express'
import cors from 'cors';
import mssql from 'mssql';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth_routes.js'
import adminAuthRoutes from './routes/admin_auth_routes.js'
import admin from './routes/admin_routes.js'
import myInfo from './routes/nhankhau.js'
import phanAnh from './routes/phananh.js'
import uploadRoutes from './routes/upload_routes.js'
import hoKhau from './routes/qlnhankhau.js'
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

mssql.connect(dbConfig)
    .then(pool=>{
        console.log('Success!');
        global.sqlPool = pool;
    })
    .catch(err=>{
        console.log('Error!',err);
        process.exit(1);
    });

const api=express();
api.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

api.use(cookieParser());
api.use(express.json());
api.set('etag', false);
api.use(express.json({ limit: '50mb' }));
api.use(express.urlencoded({ limit: '50mb', extended: true }));

api.use('/api/upload', uploadRoutes);

api.use('/api/auth',authRoutes);
api.use('/api/adminAuth', adminAuthRoutes);
api.use('/api/admin_permisson', admin);
api.use('/api/myInfo', myInfo);
api.use('/api/phanAnh', phanAnh);
api.use('/api/hoKhau', hoKhau);

api.use((req, res, next) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

api.use((err, req, res, next) => {
    console.error(err.stack); 
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || 'Lỗi server không xác định.',
    });
});

const PORT = process.env.PORT ;

api.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
});

