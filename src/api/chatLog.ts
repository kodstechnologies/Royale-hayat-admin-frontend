import api from "./axiosInstance";

const BASE = "/api/v1/chat/logs";

export type ChatLogListFilters = {
  page?: number;
  limit?: number;
  sessionId?: string;
  referenceId?: string;
  source?: "ai" | "guided_topic";
  lang?: "en" | "ar";
  success?: "true" | "false";
  isViewed?: "true" | "false";
  topicId?: string;
  search?: string;
};

export type ChatLogMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatLogRecord = {
  _id: string;
  lang: "en" | "ar";
  messages: ChatLogMessage[];
  lastUserMessage: string;
  assistantReply: string;
  model?: string;
  success: boolean;
  errorCode?: string;
  stream?: boolean;
  latencyMs?: number;
  clientIp?: string;
  sessionId?: string;
  referenceId?: string;
  source?: "ai" | "guided_topic";
  topicId?: string;
  modelsAttempted?: string[];
  isViewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatLogListMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  unviewedCount?: number;
};

export const getAllChatLogs = async (params: ChatLogListFilters = {}) => {
  const response = await api.get(BASE, { params });
  return response.data as {
    success: boolean;
    message: string;
    data: ChatLogRecord[];
    meta: ChatLogListMeta;
  };
};

export const getChatLogById = async (id: string) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ChatLogRecord;
  };
};

export const getChatLogsBySessionId = async (sessionId: string) => {
  const response = await api.get(`${BASE}/session/${encodeURIComponent(sessionId)}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ChatLogRecord[];
  };
};

export const getChatLogsByReferenceId = async (referenceId: string) => {
  const response = await api.get(
    `${BASE}/reference/${encodeURIComponent(referenceId)}`,
  );
  return response.data as {
    success: boolean;
    message: string;
    data: ChatLogRecord[];
  };
};
