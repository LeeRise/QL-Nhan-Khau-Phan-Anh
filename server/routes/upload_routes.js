import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const router = express.Router();

cloudinary.config({
    cloud_name: 'dvgkefwvh',
    api_key: '321724178842823',
    api_secret: 'c678-7yaon72Z0dvJ107TyH-5PQ'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phan_anh_dan_cu', 
        resource_type: 'auto',  
    },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
    try {
        res.json({ url: req.file.path }); 
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải lên Cloudinary" });
    }
});

export default router;