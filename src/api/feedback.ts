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
    doctor?: string;
}

export interface CreateFeedbackParams {
    data: FeedbackPayload;
    language?: string;
    addedBy?: string;
}

export interface UpdateFeedbackParams {
    id: string;
    data: FeedbackPayload;
}


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
// GET DOCTOR FEEDBACK BY ID
// ==============================
export const getDoctorFeedbackById =
    async (id: string) => {

        const response =
            await api.get(
                `/api/v1/doctor-feedback/${id}`
            );

        return response.data;
    };


// ==============================
// UPDATE DOCTOR FEEDBACK
// ==============================
export const updateDoctorFeedback =
    async ({
        id,
        data,
    }: UpdateFeedbackParams) => {

        const response =
            await api.put(
                `/api/v1/doctor-feedback/update/${id}`,
                data
            );

        return response.data;
    };


// ==============================
// DELETE DOCTOR FEEDBACK
// ==============================
export const deleteDoctorFeedback =
    async (id: string) => {

        const response =
            await api.delete(
                `/api/v1/doctor-feedback/delete/${id}`
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
// GET HOSPITAL FEEDBACK BY ID
// ==============================
export const getHospitalFeedbackById =
    async (id: string) => {

        const response =
            await api.get(
                `/api/v1/hospital-feedback/${id}`
            );

        return response.data;
    };


// ==============================
// UPDATE HOSPITAL FEEDBACK
// ==============================
export const updateHospitalFeedback =
    async ({
        id,
        data,
    }: UpdateFeedbackParams) => {

        const response =
            await api.put(
                `/api/v1/hospital-feedback/update/${id}`,
                data
            );

        return response.data;
    };


// ==============================
// DELETE HOSPITAL FEEDBACK
// ==============================
export const deleteHospitalFeedback =
    async (id: string) => {

        const response =
            await api.delete(
                `/api/v1/hospital-feedback/delete/${id}`
            );

        return response.data;
    };