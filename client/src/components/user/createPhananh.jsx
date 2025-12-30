import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitNewPhanAnh } from '../redux/phananh';
import axios from 'axios';
const CreatePhanAnh = () => {
    const dispatch = useDispatch();
    const { status, message, error } = useSelector((state) => state.phanAnh);
    const { user } = useSelector((state) => state.authUser); 

    const [formData, setFormData] = useState({
        tieuDe: '',
        ndPA: '',
        loaiVanDe: '',
        files: [],
        isAnDanh: false
    });

    const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files); 
    if (selectedFiles.length === 0) return;

    console.log("Đang tải file lên...");

    try {
        const uploadPromises = selectedFiles.map(async (file) => {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await axios.post('http://localhost:3000/api/upload', formDataUpload);
            
            return {
                url: response.data.url,
                type: file.type.includes('video') ? 'video' : 'image'
            };
        });

        const uploadedResults = await Promise.all(uploadPromises);

        setFormData(prev => ({
            ...prev,
            files: [...prev.files, ...uploadedResults]
        }));

    } catch (err) {
        console.error("Upload error:", err);
        alert("Lỗi khi tải một hoặc nhiều file lên.");
    }
};
    const removeFile = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
};
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(submitNewPhanAnh(formData.tieuDe, formData.ndPA,formData.loaiVanDe, user.Ma_CCCD, formData.files,formData.isAnDanh));
    };

    return (
        <div className="phan-anh-create-container">
            <h2 >Gửi Phản Ánh Mới</h2>
            
            <form onSubmit={handleSubmit} className="tieudePA">
                <div>
                    <label className="PA-content">Tiêu đề phản ánh</label>
                    <input 
                        type="text" required
                        className='input-PA'
                        onChange={(e) => setFormData({...formData, tieuDe: e.target.value})}
                    />
                </div>

                <div>
                    <label className="PA-content">Loại vấn đề</label>
                    <select 
                        className="select-problem"
                        onChange={(e) => setFormData({...formData, loaiVanDe: e.target.value})}
                    >
                        <option value="">-- Chọn loại vấn đề --</option>
                        <option value="An ninh">An ninh</option>
                        <option value="Môi trường">Môi trường</option>
                        <option value="Hạ tầng">Hạ tầng</option>
                        <option value="Đời sống & Xã Hội">Đời sống & Xã Hội</option>
                    </select>
                </div>
                <div>
    <label className="PA-content">Chi tiết nội dung phản ánh</label>
    <textarea 
        required
        className="input-PA"
        placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
        onChange={(e) => setFormData({...formData, ndPA: e.target.value})}
    />
</div>

                <div>
    <label className="block font-medium">Đính kèm (Ảnh/Video)</label>
    <input 
        type="file" 
        multiple 
        accept="image/*,video/*"
        className="file-chose" 
        onChange={handleFileChange}
    />

    {formData.files.length > 0 && (
        <div >
            {formData.files.map((file, index) => (
                <div key={index} >
                    {file.type === 'image' ? (
                        <img 
                            src={file.url} 
                            alt="preview" 
                        />
                    ) : (
                        <video 
                        src={file.url}
                        muted
                        />
                    )}
                    
                    <button
                        type="button"
                        onClick={() => removeFile(index)}
                       
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    )}
</div>
<div >
    <input 
        type="checkbox" 
        id="anDanh"
        checked={formData.isAnDanh}
        onChange={(e) => setFormData({...formData, isAnDanh: e.target.checked})}
    />
    <label htmlFor="anDanh" className="PA-content" style={{marginBottom: 0}}>
        Gửi ẩn danh (Cán bộ sẽ không thấy tên bạn)
    </label>
</div>
                <button 
                    disabled={status === 'loading'}
                    className="btn-primary"
                >
                    {status === 'loading' ? 'Đang gửi...' : 'Gửi Phản Ánh'}
                </button>

                {message && <p className="error-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default CreatePhanAnh;