export const getMenuItems = (Ma_VT) => {
    const baseMenu = [
        { path: '/', name: 'Trang chủ' },
        {path: '/change-password', name: 'Thay đổi mật khẩu'},
        { path: '/profile', name: 'Thông tin cá nhân' },
        { path: '/profile1', name: 'Thông tin hộ khẩu' },
        { path: '/phan-anh/lich-su', name: 'Lịch sử phản ánh' },
        { path: '/phan-anh/them-moi', name: 'Thêm phản ánh mới' },
    ];

    if (Ma_VT === 6) return [...baseMenu];
    if (Ma_VT >= 2 && Ma_VT <= 3) {
        return [...baseMenu,
            { path: '/can-bo/thong-tin-ho-khau', name: 'Thông tin Hộ khẩu chung' },
            { path: '/can-bo/thay-doi-ho-khau', name: 'Thay đổi thông tin Hộ khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/1', name: 'Đăng kí hộ khẩu mới ' },
            { path: '/can-bo/thay-doi-ho-khau/2', name: 'Tách hộ khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/3', name: 'Chuyển đi cả hộ' },
            { path: '/can-bo/thay-doi-ho-khau/4', name: 'Thêm thành viên' },
            { path: '/can-bo/thay-doi-ho-khau/5', name: 'Thay đổi thông tin Nhân khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/6', name: 'Thay đổi nhân khẩu- chuyển đi' },
            { path: '/can-bo/thay-doi-ho-khau/7', name: 'Tạm trú tạm vắng' },
            { path: '/can-bo/thong-ke', name: 'Thống kê' },
            { path: '/can-bo/thong-ke-nhan-khau', name: 'Thông kê nhân khẩu theo yêu cầu' },
            { path: '/can-bo/thong-ke-tam-tru/vang', name: 'Thống kê tạm trú/tạm vắng' },
            { path: '/can-bo/thay-doi-phan-anh', name: 'Thay đổi thông tin Phản ánh' },
            { path: '/can-bo/thong-ke-thay-doi', name: 'Thống kê thay đổi' },
            { path: '/can-bo/thong-ke-phan-anh', name: 'Thống kê phản ánh' }
        ];
    }
    if (Ma_VT === 4) {
        return [...baseMenu,
            { path: '/can-bo/thong-tin-ho-khau', name: 'Thông tin Hộ khẩu chung' },
            { path: '/can-bo/thay-doi-ho-khau', name: 'Thay đổi thông tin Hộ khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/1', name: 'Đăng kí hộ khẩu mới ' },
            { path: '/can-bo/thay-doi-ho-khau/2', name: 'Tách hộ khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/3', name: 'Chuyển đi cả hộ' },
            { path: '/can-bo/thay-doi-ho-khau/4', name: 'Thêm thành viên' },
            { path: '/can-bo/thay-doi-ho-khau/5', name: 'Thay đổi thông tin Nhân khẩu' },
            { path: '/can-bo/thay-doi-ho-khau/6', name: 'Thay đổi nhân khẩu- chuyển đi' },
            { path: '/can-bo/thay-doi-ho-khau/7', name: 'Tạm trú tạm vắng' },
            { path: '/can-bo/thong-ke', name: 'Thống kê' },
            { path: '/can-bo/thong-ke-nhan-khau', name: 'Thông kê nhân khẩu theo yêu cầu' },
            { path: '/can-bo/thong-ke-tam-tru/vang', name: 'Thống kê tạm trú/tạm vắng' },
        ];
    }
    if (Ma_VT === 5) {
        return [...baseMenu,
            { path: '/can-bo/thay-doi-phan-anh', name: 'Thay đổi thông tin Phản ánh' },
            { path: '/can-bo/thong-ke-phan-anh', name: 'Thống kê phản ánh' },
            
        ];
    }
    if (Ma_VT === 1) {
        return [{ path: '/admin/cap-quyen', name: 'Quản lý Phân quyền' },
            { path: '/', name: 'Trang chủ' },
        ];
    }
    return [];
};

export const hasPermission = (Ma_VT, currentPath) => {
    const allowedItems = getMenuItems(Ma_VT);
    return allowedItems.some(item => item.path === currentPath);
};