import axiosClient from "./axiosClient";

const API_URL = "/phananh";

// User APIs
export const getMyPhanAnh = () => {
  return axiosClient.get(`${API_URL}/my`);
};

export const createMyPhanAnh = (data) => {
  return axiosClient.post(`${API_URL}/my`, data);
};

// Admin APIs
export const getAllPhanAnh = () => {
  return axiosClient.get(API_URL);
};

export const getPhanAnhById = (id) => {
  return axiosClient.get(`${API_URL}/${id}`);
};

export const createPhanAnh = (data) => {
  return axiosClient.post(API_URL, data);
};

export const updatePhanAnh = (id, data) => {
  return axiosClient.put(`${API_URL}/${id}`, data);
};

// Hàm mới: Admin gửi phản hồi cho người dân
export const replyPhanAnh = (id, data) => {
  return axiosClient.put(`${API_URL}/${id}/phan-hoi`, data);
};

export const deletePhanAnh = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};


