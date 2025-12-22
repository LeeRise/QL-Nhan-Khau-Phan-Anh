import axiosClient from "./axiosClient";

const API_URL = "/biendong";

// User APIs
export const getMyBienDong = () => {
  return axiosClient.get(`${API_URL}/my`);
};

export const getMyInfo = () => {
  return axiosClient.get(`${API_URL}/my-info`);
};

export const createBienDong = (data) => {
  return axiosClient.post(`${API_URL}/my`, data);
};

export const updateMyStatus = (data) => {
  return axiosClient.put(`${API_URL}/my-status`, data);
};

// Admin APIs
export const getAllBienDong = () => {
  return axiosClient.get(API_URL);
};
