import axiosClient from "./axiosClient";

const API_URL = "/hokhau";

export const getAllHoKhau = () => {
  return axiosClient.get(API_URL);
};

export const getHoKhauById = (id) => {
  return axiosClient.get(`${API_URL}/${id}`);
};

export const createHoKhau = (data) => {
  return axiosClient.post(API_URL, data);
};

export const updateHoKhau = (id, data) => {
  return axiosClient.put(`${API_URL}/${id}`, data);
};

export const deleteHoKhau = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};

// Lấy danh sách nhân khẩu trong một hộ khẩu cụ thể
export const getMembersByHoKhau = (id) => {
  return axiosClient.get(`${API_URL}/${id}/members`);
};


export const addMemberToHoKhau = (data) => {
  // data gồm { Ma_NK, Ma_HK }
  return axiosClient.post(`${API_URL}/add-member`, data);
};

// User: Gửi yêu cầu muốn nhập vào một hộ khẩu nào đó
export const requestJoinHoKhau = (data) => {
  // Gửi dưới dạng một loại phản ánh đặc biệt để Admin duyệt
  return axiosClient.post(`/phananh/my`, {
    Tieu_De: `Yêu cầu nhập khẩu vào hộ khẩu mã: ${data.Ma_HK}`,
    Loai_Van_De: "Yêu cầu nhập khẩu",
    Noi_Dung: `Tôi muốn nhập khẩu vào hộ khẩu tại địa chỉ: ${data.Dia_Chi}`
  });
};