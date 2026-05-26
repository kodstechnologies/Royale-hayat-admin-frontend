import api from "./axiosInstance";
export const getCSR = async () => {
  const { data } = await api.get(`/api/v1/csr`);
  return data;
};  

export const postCSR = async (body: Object) => {
  
  const { data } = await api.post(`/api/v1/csr`, body);
  return data;
};

export const deleteCSR = async (id: String) => {
  const { data } = await api.delete(`/api/v1/csr/${id}`);
  return data;
};
export const updateCSR = async (id: String, body: Object) => {
  const { data } = await api.put(`/api/v1/csr/${id}`, body);
  return data;
};
export const getCSRById = async (id: String) => {
  const { data } = await api.get(`/api/v1/csr/${id}`);
  return data;
};