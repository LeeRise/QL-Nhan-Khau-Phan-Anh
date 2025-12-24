import axiosClient from "./axiosClient";

const API_URL = "/thongke";

// Lấy thống kê tổng quan (số lượng nhân khẩu, hộ khẩu, phản ánh mới)
export const getGeneralStats = () => {
  return axiosClient.get(`${API_URL}/tong-quan`);
};

// Lấy thống kê chi tiết 3 loại: An ninh, Môi trường, Xã hội
export const getDetailedStats = () => {
  return axiosClient.get(`${API_URL}/phan-anh-chi-tiet`);
};