import api from "./axiosInstance";

export interface FeedbackPayload {
    userName?: string;
    arabicUserName?: string;
    feedback?: string;
    arabicFeedback?: string;
    stars: number;
    shownOnWebsite?: boolean;
    doctorId?: string;
    doctor?: string;
    feedbackId?: string;
}

export interface CreateFeedbackParams {
    data: FeedbackPayload;
    language?: string;
    addedBy?: string;
}

export interface UpdateDoctorFeedbackParams {
    feedbackId: string;
    /** Doctor document MongoDB _id (URL path segment) */
    doctorId: string;
    data: FeedbackPayload;
}

export interface UpdateHospitalFeedbackParams {
    feedbackId: string;
    data: FeedbackPayload;
}

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type FeedbackCounts = {
    total: number;
    doctorFeedbacks: number;
    hospitalFeedbacks: number;
};

export const createDoctorFeedback =
    async ({
        data,
        language,
        addedBy
    }: CreateFeedbackParams) => {

        const query =
            new URLSearchParams();

        if (language) {

            query.append(
                "language",
                language
            );
        }

        if (addedBy) {

            query.append(
                "addedBy",
                addedBy
            );
        }

        const response =
            await api.post(
                `/api/v1/doctor-feedback/create?${query.toString()}`,
                data
            );

        return response.data;
    };

export const getAllDoctorFeedbacks =
    async () => {

        const response =
            await api.get(
                `/api/v1/doctor-feedback/all`
            );

        return response.data;
    };

/** @param doctorMongoId Doctor document MongoDB _id */
export const getDoctorFeedbacksByDoctorId =
    async (doctorMongoId: string) => {

        const response =
            await api.get(
                `/api/v1/doctor-feedback/${doctorMongoId}`
            );

        return response.data;
    };

export const getDoctorFeedbackById = getDoctorFeedbacksByDoctorId;

export const updateDoctorFeedback =
    async ({
        feedbackId,
        doctorId,
        data,
    }: UpdateDoctorFeedbackParams) => {

        const response =
            await api.put(
                `/api/v1/doctor-feedback/update/${doctorId}`,
                { ...data, feedbackId }
            );

        return response.data;
    };

export const deleteDoctorFeedback =
    async (doctorMongoId: string, feedbackId: string) => {

        const response =
            await api.delete(
                `/api/v1/doctor-feedback/delete/${doctorMongoId}`,
                { data: { feedbackId } }
            );

        return response.data;
    };

export const createHospitalFeedback =
    async ({
        data,
        language,
        addedBy
    }: CreateFeedbackParams) => {

        const query =
            new URLSearchParams();

        if (language) {

            query.append(
                "language",
                language
            );
        }

        if (addedBy) {

            query.append(
                "addedBy",
                addedBy
            );
        }

        const response =
            await api.post(
                `/api/v1/hospital-feedback/create?${query.toString()}`,
                data
            );

        return response.data;
    };

export const getAllHospitalFeedbacks =
    async () => {

        const response =
            await api.get(
                `/api/v1/hospital-feedback/all`
            );

        return response.data;
    };

export const getHospitalFeedbackById =
    async (feedbackId: string) => {

        const response =
            await api.get(
                `/api/v1/hospital-feedback/${feedbackId}`
            );

        return response.data;
    };

export const updateHospitalFeedback =
    async ({
        feedbackId,
        data,
    }: UpdateHospitalFeedbackParams) => {

        const response =
            await api.put(
                `/api/v1/hospital-feedback/update/${feedbackId}`,
                data
            );

        return response.data;
    };

export const deleteHospitalFeedback =
    async (feedbackId: string) => {

        const response =
            await api.delete(
                `/api/v1/hospital-feedback/delete/${feedbackId}`
            );

        return response.data;
    };

export const getFeedbackCounts =
    async () => {

        const response =
            await api.get<ApiResponse<FeedbackCounts>>(
                `/api/v1/doctor-feedback/counts`
            );

        return response.data;
    };

export const markDoctorFeedbackViewed = async (feedbackId: string) => {
    const response = await api.patch(
        `/api/v1/doctor-feedback/view/${feedbackId}`,
    );
    return response.data;
};

export const markHospitalFeedbackViewed = async (feedbackId: string) => {
    const response = await api.patch(
        `/api/v1/hospital-feedback/view/${feedbackId}`,
    );
    return response.data;
};