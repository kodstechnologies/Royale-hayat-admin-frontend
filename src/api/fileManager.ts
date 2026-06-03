import api from "./axiosInstance";

const BASE = "/api/v1/file-manager";

export type FileManagerFile = {
  _id: string;
  slno: number;
  s3Key: string;
  s3Url: string;
  previewUrl?: string;
  size: number;
  sizeFormatted?: string;
  originalName: string;
  mimeType?: string;
  createdAt?: string;
};

export type UploadFileMeta = {
  fileName?: string;
  slno?: number;
};

export type FileManagerFolder = {
  _id: string;
  name: string;
  parent: string | null;
  files?: FileManagerFile[];
  fileCount?: number;
  totalSize?: number;
  totalSizeFormatted?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const listFolders = async (parent?: string | null) => {
  const params =
    parent === undefined || parent === null
      ? { parent: "root" }
      : { parent };
  const response = await api.get(`${BASE}/folders`, { params });
  return response.data;
};

export const getFolderById = async (id: string) => {
  const response = await api.get(`${BASE}/folders/${id}`);
  return response.data;
};

export const createFolder = async (payload: {
  name: string;
  parent?: string | null;
}) => {
  const response = await api.post(`${BASE}/folders`, payload);
  return response.data;
};

export const renameFolder = async (id: string, name: string) => {
  const response = await api.patch(`${BASE}/folders/${id}`, { name });
  return response.data;
};

export const deleteFolder = async (id: string) => {
  const response = await api.delete(`${BASE}/folders/${id}`);
  return response.data;
};

export const uploadFolderFiles = async (
  folderId: string,
  files: File[],
  meta?: UploadFileMeta[]
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (meta?.length) {
    formData.append("meta", JSON.stringify(meta));
  }
  const response = await api.post(`${BASE}/folders/${folderId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateFolderFile = async (
  folderId: string,
  fileId: string,
  payload: { originalName?: string; slno?: number },
  replacementFile?: File
) => {
  const formData = new FormData();
  if (payload.originalName) {
    formData.append("originalName", payload.originalName);
  }
  if (payload.slno !== undefined) {
    formData.append("slno", String(payload.slno));
  }
  if (replacementFile) {
    formData.append("file", replacementFile);
  }
  const response = await api.patch(
    `${BASE}/folders/${folderId}/files/${fileId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const deleteFolderFile = async (folderId: string, fileId: string) => {
  const response = await api.delete(
    `${BASE}/folders/${folderId}/files/${fileId}`
  );
  return response.data;
};
