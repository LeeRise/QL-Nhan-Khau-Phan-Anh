import axiosClient from "./axiosClient";

const API_URL = "/nhankhau";

export const getAllNhanKhau = (query = "") => {
  return axiosClient.get(`${API_URL}?q=${query}`);
};

export const getNhanKhauById = (id) => {
  return axiosClient.get(`${API_URL}/${id}`);
};

export const createNhanKhau = (data) => {
  return axiosClient.post(API_URL, data);
};

export const updateNhanKhau = (id, data) => {
  return axiosClient.put(`${API_URL}/${id}`, data);
};

export const deleteNhanKhau = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};

export const addTreSinh = (data) => {
  return axiosClient.post(`${API_URL}/tre-sinh`, data);
};

export const chuyenHoKhau = (id, data) => {
  return axiosClient.put(`${API_URL}/chuyen-ho-khau/${id}`, data);
};

export const doiTrangThai = (id, data) => {
  return axiosClient.put(`${API_URL}/doi-trang-thai/${id}`, data);
};
