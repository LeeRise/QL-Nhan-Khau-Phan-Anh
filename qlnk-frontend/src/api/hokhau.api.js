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

// Thêm thành viên vào hộ khẩu (quan hệ chủ hộ, con, vợ...)
export const addMemberToHoKhau = (data) => {
  return axiosClient.post(`${API_URL}/add-member`, data);
};