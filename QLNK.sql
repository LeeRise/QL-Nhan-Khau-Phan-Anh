PRAGMA foreign_keys = ON;

-- Bảng Quyen
CREATE TABLE IF NOT EXISTS Quyen(
    Ma_Quyen INTEGER PRIMARY KEY AUTOINCREMENT,
    Ten_Quyen TEXT UNIQUE NOT NULL
);

-- Bảng Vai_Tro
CREATE TABLE IF NOT EXISTS Vai_Tro(
    Ma_VT INTEGER PRIMARY KEY AUTOINCREMENT,
    Ten_VT TEXT NOT NULL
);

-- Bảng Vai_Tro_Quyen
CREATE TABLE IF NOT EXISTS Vai_Tro_Quyen(
    Ma_VT INTEGER NOT NULL,
    Ma_Quyen INTEGER NOT NULL,
    PRIMARY KEY(Ma_VT, Ma_Quyen),
    FOREIGN KEY(Ma_VT) REFERENCES Vai_Tro(Ma_VT),
    FOREIGN KEY(Ma_Quyen) REFERENCES Quyen(Ma_Quyen)
);

-- Bảng Ho_Khau
CREATE TABLE IF NOT EXISTS Ho_Khau(
    Ma_HK INTEGER PRIMARY KEY AUTOINCREMENT,
    Dia_Chi TEXT UNIQUE NOT NULL,
    Ngay_Lap DATE NOT NULL,
    CCCD_Chu_Ho TEXT,
    Tinh_Trang TEXT DEFAULT 'Tồn tại',
    FOREIGN KEY(CCCD_Chu_Ho) REFERENCES Nhan_Khau(Ma_CCCD)
);

-- Bảng Nhan_Khau
CREATE TABLE IF NOT EXISTS Nhan_Khau(
    Ma_NK INTEGER PRIMARY KEY AUTOINCREMENT,
    Ma_CCCD TEXT UNIQUE,
    Ma_HK INTEGER,
    Ho_Ten TEXT NOT NULL,   
    Ngay_Sinh DATE NOT NULL,
    Ngay_Cap_CC DATE,
    Noi_Cap TEXT,
    DC_TT TEXT,
    Gioi_Tinh TEXT NOT NULL,
    Email TEXT,
    Que_Quan TEXT,
    Noi_Sinh TEXT,
    TT_Hon_Nhan TEXT,
    Bi_Danh TEXT,
    Nghe_Nghiep TEXT,
    Noi_Lam_Viec TEXT,
    Trang_Thai TEXT DEFAULT 'Đang sống',
    FOREIGN KEY(Ma_HK) REFERENCES Ho_Khau(Ma_HK)
);

-- Bảng lien_ket_HK
CREATE TABLE IF NOT EXISTS lien_ket_HK(
    Ma_HK INTEGER NOT NULL,
    Ma_CCCD TEXT NOT NULL,
    Quan_He TEXT NOT NULL,
    PRIMARY KEY(Ma_HK, Ma_CCCD),
    FOREIGN KEY(Ma_HK) REFERENCES Ho_Khau(Ma_HK),
    FOREIGN KEY(Ma_CCCD) REFERENCES Nhan_Khau(Ma_CCCD)
);

-- Bảng Nguoi_Dung
CREATE TABLE IF NOT EXISTS Nguoi_Dung(
    Ma_ND INTEGER PRIMARY KEY AUTOINCREMENT,
    Ma_CCCD TEXT,
    Ten_DN TEXT UNIQUE NOT NULL,
    Mat_Khau TEXT NOT NULL,
    Ma_VT INTEGER NOT NULL,
    FOREIGN KEY(Ma_CCCD) REFERENCES Nhan_Khau(Ma_CCCD),
    FOREIGN KEY(Ma_VT) REFERENCES Vai_Tro(Ma_VT)
);

-- Bảng Bien_Dong_HK
CREATE TABLE IF NOT EXISTS Bien_Dong_HK(
    Ma_BD INTEGER PRIMARY KEY AUTOINCREMENT,
    Loai_Bien_Dong TEXT NOT NULL,
    Ma_NK INTEGER,
    Ma_HK INTEGER,
    Ngay_Thuc_Hien DATE NOT NULL,
    Ngay_Ket_Thuc DATE,
    DC_Cu TEXT,
    Ghi_Chu TEXT,
    DC_Moi TEXT
);

-- Bảng Phan_Anh
CREATE TABLE IF NOT EXISTS Phan_Anh(
    Ma_PA INTEGER PRIMARY KEY AUTOINCREMENT,
    Tieu_De TEXT NOT NULL,
    Ngay_PA DATETIME DEFAULT CURRENT_TIMESTAMP,
    Loai_Van_De TEXT,
    Ma_CCCD TEXT,
    Trang_Thai TEXT DEFAULT 'Chưa Tiếp nhận',
    FOREIGN KEY(Ma_CCCD) REFERENCES Nhan_Khau(Ma_CCCD)
);

-- Bảng File_PA
CREATE TABLE IF NOT EXISTS File_PA(
    Ma_File TEXT PRIMARY KEY, -- UUID, lưu dạng TEXT
    Ma_PA INTEGER NOT NULL,
    URL_File TEXT NOT NULL,
    Loai_File TEXT,
    FOREIGN KEY(Ma_PA) REFERENCES Phan_Anh(Ma_PA)
);

-- Bảng Phan_Hoi
CREATE TABLE IF NOT EXISTS Phan_Hoi(
    Ma_PH INTEGER PRIMARY KEY AUTOINCREMENT,
    Ma_PA INTEGER NOT NULL,
    Ngay_PH DATETIME DEFAULT CURRENT_TIMESTAMP,
    Noi_Dung TEXT NOT NULL,
    Ma_CCCD_XL TEXT NOT NULL,
    FOREIGN KEY(Ma_PA) REFERENCES Phan_Anh(Ma_PA),
    FOREIGN KEY(Ma_CCCD_XL) REFERENCES Nhan_Khau(Ma_CCCD)
);

-- Bảng Gop_PA
CREATE TABLE IF NOT EXISTS Gop_PA(
    Ma_PA_Goc INTEGER NOT NULL,
    Ma_PA_Duoc_Gop INTEGER NOT NULL,
    So_Lan INTEGER DEFAULT 1,
    PRIMARY KEY(Ma_PA_Goc, Ma_PA_Duoc_Gop),
    FOREIGN KEY(Ma_PA_Goc) REFERENCES Phan_Anh(Ma_PA),
    FOREIGN KEY(Ma_PA_Duoc_Gop) REFERENCES Phan_Anh(Ma_PA),
    CHECK(Ma_PA_Goc <> Ma_PA_Duoc_Gop)
);

-- Dữ liệu mẫu Vai_Tro
INSERT INTO Vai_Tro(Ten_VT) VALUES
('SuperAdmin'),
('Tổ trưởng'),
('Tổ phó'),
('Cán bộ Xử lý PA'),
('Cán bộ Quản lý NK'),
('Người Dân');

-- Dữ liệu mẫu Quyen
INSERT INTO Quyen(Ten_Quyen) VALUES
('system_config'),
('user_management'),
('nhankhau_edit'),
('nhankhau_view'),
('phananh_edit'),
('phananh_view'),
('report_export');
