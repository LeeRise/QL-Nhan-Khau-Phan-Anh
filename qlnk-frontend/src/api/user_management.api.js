import axiosClient from "./axiosClient";

export const getAllUsers = () => {
  return axiosClient.get("/admin/users");
};

export const updateUserRole = (userId, roleId) => {
  return axiosClient.put(`/admin/users/${userId}/role`, { roleId });
};