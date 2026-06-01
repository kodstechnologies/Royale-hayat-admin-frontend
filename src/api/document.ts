import api from "./axiosInstance";

const BASE = "/api/v1/documents";

export type CreateDocumentPayload = {
  title: string;
  catagory: "Brochure" | "Form" | "Guide" | "Policy";
  description: string;
  status?: "active" | "inactive";
  file: File;
};

export const createDocument = async (
  data: CreateDocumentPayload
) => {

  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("catagory", data.catagory);
  formData.append("description", data.description);

  if (data.status) {
    formData.append("status", data.status);
  }

  formData.append("file", data.file);

  const response = await api.post(
    `${BASE}/create`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAllDocuments = async () => {

  const response = await api.get(
    `${BASE}/all`
  );

  return response.data;
};

export const getDocumentById = async (
  id: string
) => {

  const response = await api.get(
    `${BASE}/${id}`
  );

  return response.data;
};

export type UpdateDocumentPayload = {
  title?: string;
  catagory?: "Brochure" | "Form" | "Guide" | "Policy";
  description?: string;
  status?: "active" | "inactive";
  file?: File;
};

export const updateDocument = async (
  id: string,
  data: UpdateDocumentPayload
) => {

  const formData = new FormData();

  if (data.title) {
    formData.append("title", data.title);
  }

  if (data.catagory) {
    formData.append("catagory", data.catagory);
  }

  if (data.description) {
    formData.append(
      "description",
      data.description
    );
  }

  if (data.status) {
    formData.append("status", data.status);
  }

  if (data.file) {
    formData.append("file", data.file);
  }

  const response = await api.put(
    `${BASE}/update/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteDocument = async (
  id: string
) => {

  const response = await api.delete(
    `${BASE}/delete/${id}`
  );

  return response.data;
};