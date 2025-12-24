import axiosClient from "./axiosClient";

const API_URL = "/phananh";

// User APIs
export const getMyPhanAnh = () => {
  return axiosClient.get(`${API_URL}/my`);
};

export const createMyPhanAnh = (data) => {
  // If data contains a file, send as FormData
  if (data instanceof FormData) {
    return axiosClient.post(`${API_URL}/my`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
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

export const deletePhanAnh = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};
