import api from "./axiosInstance";


// ======================================================
// TYPES
// ======================================================

export interface FeedbackPayload {
    userName?: string;
    arabicUserName?: string;
    feedback?: string;
    arabicFeedback?: string;
    stars: number;
    shownOnWebsite?: boolean;
    /** Business doctor id (preferred) */
    doctorId?: string;
    /** @deprecated use doctorId */
    doctor?: string;
    feedbackId?: string;
}

export interface CreateFeedbackParams {
    data: FeedbackPayload;
    language?: string;
    addedBy?: string;
}

export interface UpdateDoctorFeedbackParams {
    /** MongoDB _id of the feedback document */
    feedbackId: string;
    /** Business doctor id */
    doctorId: string;
    data: FeedbackPayload;
}

export interface UpdateHospitalFeedbackParams {
    /** MongoDB _id of the hospital feedback document */
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


// ======================================================
// DOCTOR FEEDBACK APIs
// ======================================================


// ==============================
// CREATE DOCTOR FEEDBACK
// ==============================
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


// ==============================
// GET ALL DOCTOR FEEDBACKS
// ==============================
export const getAllDoctorFeedbacks =
    async () => {

        const response =
            await api.get(
                `/api/v1/doctor-feedback/all`
            );

        return response.data;
    };


// ==============================
// GET DOCTOR FEEDBACKS BY doctorId (business id, not MongoDB _id)
// ==============================
export const getDoctorFeedbacksByDoctorId =
    async (doctorId: string) => {

        const response =
            await api.get(
                `/api/v1/doctor-feedback/${doctorId}`
            );

        return response.data;
    };

/** @deprecated Use getDoctorFeedbacksByDoctorId */
export const getDoctorFeedbackById = getDoctorFeedbacksByDoctorId;


// ==============================
// UPDATE DOCTOR FEEDBACK
// ==============================
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


// ==============================
// DELETE DOCTOR FEEDBACK
// ==============================
export const deleteDoctorFeedback =
    async (doctorId: string, feedbackId: string) => {

        const response =
            await api.delete(
                `/api/v1/doctor-feedback/delete/${doctorId}`,
                { data: { feedbackId } }
            );

        return response.data;
    };





// ======================================================
// HOSPITAL FEEDBACK APIs
// ======================================================


// ==============================
// CREATE HOSPITAL FEEDBACK
// ==============================
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


// ==============================
// GET ALL HOSPITAL FEEDBACKS
// ==============================
export const getAllHospitalFeedbacks =
    async () => {

        const response =
            await api.get(
                `/api/v1/hospital-feedback/all`
            );

        return response.data;
    };


// ==============================
// GET HOSPITAL FEEDBACK BY feedbackId (MongoDB _id)
// ==============================
export const getHospitalFeedbackById =
    async (feedbackId: string) => {

        const response =
            await api.get(
                `/api/v1/hospital-feedback/${feedbackId}`
            );

        return response.data;
    };


// ==============================
// UPDATE HOSPITAL FEEDBACK
// ==============================
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


// ==============================
// DELETE HOSPITAL FEEDBACK
// ==============================
export const deleteHospitalFeedback =
    async (feedbackId: string) => {

        const response =
            await api.delete(
                `/api/v1/hospital-feedback/delete/${feedbackId}`
            );

        return response.data;
    };


// ==============================
// GET UNVIEWED FEEDBACK COUNTS
// ==============================
export const getFeedbackCounts =
    async () => {

        const response =
            await api.get<ApiResponse<FeedbackCounts>>(
                `/api/v1/doctor-feedback/counts`
            );

        return response.data;
    };