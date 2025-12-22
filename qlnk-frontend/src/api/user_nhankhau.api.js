import axiosClient from "./axiosClient";

const API_URL = "/user/nhankhau";

export const checkMyNhanKhau = () => {
  return axiosClient.get(`${API_URL}/check`);
};

export const updateMyNhanKhau = (data) => {
  return axiosClient.post(`${API_URL}/update`, data);
};
