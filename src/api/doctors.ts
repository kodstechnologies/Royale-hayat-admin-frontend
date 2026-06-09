import api from "./axiosInstance";

export type ApiDoctor = {
  _id: string;
  doctorId: string;
  name: string;
  nameAr: string;
  department?: string | { _id?: string; name?: string; arabicName?: string };
  subspecialities?: string[];
  subspecialitiesAr?: string[];
  title?: string;
  titleAr?: string;
  qualifications?: string[];
  qualificationsAr?: string[];
  expertise?: string[];
  expertiseAr?: string[];
  languages?: string[];
  languagesAr?: string[];
  initials?: string;
  initialsAr?: string;
  availableOnline?: boolean;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorListItem = {
  _id: string;
  doctorId: string;
  name: string;
  arabicName: string;
  specialty: string;
  specialtyAr: string;
  department: string | { _id?: string; name?: string; arabicName?: string };
  title: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
};

export type DoctorViewData = {
  doctorId: string;
  name: string;
  arabicName: string;
  specialty: string;
  department: string;
  departmentAr: string;
  title: string;
  arabicTitle: string;
  qualifications: string[];
  arabicQualifications: string[];
  expertise: string[];
  arabicExpertise: string[];
  languages: string[];
  arabicLanguages: string[];
  initials: string;
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
};

export type DoctorPayload = {
  doctorId?: string;
  name: string;
  specialty: string;
  department?: string;
  title: string;
  bio: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  image?: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  isActive: boolean;
};

const resolveDepartment = (department: ApiDoctor["department"]) => {
  if (department && typeof department === "object") {
    return {
      departmentId: String(department._id ?? ""),
      departmentName: String(department.name ?? ""),
      departmentNameAr: String(department.arabicName ?? department.name ?? ""),
    };
  }
  return { departmentId: "", departmentName: "", departmentNameAr: "" };
};

export const mapApiDoctorToListItem = (
  row: ApiDoctor,
  featuredDoctorIds: Set<string>,
): DoctorListItem => {
  const dept = resolveDepartment(row.department);
  const specialty =
    row.subspecialities?.[0] || row.title?.split(",")[0]?.trim() || "General";

  return {
    _id: String(row._id ?? ""),
    doctorId: String(row.doctorId ?? ""),
    name: String(row.name ?? ""),
    arabicName: String(row.nameAr ?? ""),
    specialty,
    specialtyAr:
      row.subspecialitiesAr?.[0] ||
      row.titleAr?.split(",")[0]?.trim() ||
      specialty,
    department:
      row.department && typeof row.department === "object"
        ? row.department
        : dept.departmentName || String(row.department ?? ""),
    title: String(row.title ?? ""),
    qualifications: Array.isArray(row.qualifications) ? row.qualifications : [],
    expertise: Array.isArray(row.expertise) ? row.expertise : [],
    languages: Array.isArray(row.languages) ? row.languages : [],
    initials: String(row.initials ?? "Dr."),
    availableOnline: row.availableOnline === true,
    image: row.image,
    isActive: row.isActive !== false,
    isFeatured: featuredDoctorIds.has(String(row._id ?? "")),
  };
};

export const mapApiDoctorToView = (row: ApiDoctor): DoctorViewData => {
  const dept = resolveDepartment(row.department);
  return {
    doctorId: String(row.doctorId ?? ""),
    name: String(row.name ?? ""),
    arabicName: String(row.nameAr ?? row.name ?? ""),
    specialty: row.subspecialities?.[0] || row.title || "",
    department: dept.departmentName,
    departmentAr: dept.departmentNameAr,
    title: String(row.title ?? ""),
    arabicTitle: String(row.titleAr ?? row.title ?? ""),
    qualifications: Array.isArray(row.qualifications) ? row.qualifications : [],
    arabicQualifications: Array.isArray(row.qualificationsAr)
      ? row.qualificationsAr
      : [],
    expertise: Array.isArray(row.expertise) ? row.expertise : [],
    arabicExpertise: Array.isArray(row.expertiseAr) ? row.expertiseAr : [],
    languages: Array.isArray(row.languages) ? row.languages : [],
    arabicLanguages: Array.isArray(row.languagesAr) ? row.languagesAr : [],
    initials: String(row.initials ?? "Dr."),
    availableOnline: row.availableOnline === true,
    image: row.image,
    isActive: row.isActive !== false,
  };
};

export const mapApiDoctorToFormValues = (
  row: ApiDoctor,
  deptSubspecialities: Array<{ _id: string; name: string }>,
) => {
  const dept = resolveDepartment(row.department);
  const subspecialityIds = deptSubspecialities
    .filter(
      (sub) =>
        row.subspecialities?.includes(sub.name) ||
        row.subspecialitiesAr?.includes(sub.arabicName),
    )
    .map((sub) => sub._id);

  return {
    doctorId: String(row.doctorId ?? ""),
    name: String(row.name ?? ""),
    title: String(row.title ?? ""),
    initials: String(row.initials ?? "Dr."),
    languages: (row.languages ?? []).join("|||"),
    expertise: (row.expertise ?? []).join("|||"),
    qualifications: (row.qualifications ?? []).join("|||"),
    arabicName: String(row.nameAr ?? ""),
    arabicTitle: String(row.titleAr ?? ""),
    arabicInitials: String(row.initialsAr ?? "د."),
    arabicLanguages: (row.languagesAr ?? []).join("|||"),
    arabicExpertise: (row.expertiseAr ?? []).join("|||"),
    arabicQualifications: (row.qualificationsAr ?? []).join("|||"),
    department: dept.departmentId,
    subspecialityIds,
    availableOnline: row.availableOnline === true,
    imageFile: null as File | null,
    imageUrl: row.image ?? "",
  };
};

export const getDoctors = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get("/api/v1/doctors", { params });
};

export const getDoctorById = async (id: string) => {
  return api.get(`/api/v1/doctors/${id}`);
};

export const createDoctor = async (payload: FormData) => {
  return api.post("/api/v1/doctors", payload);
};

export const editDoctor = async (id: string, payload: FormData) => {
  return api.put(`/api/v1/doctors/${id}`, payload);
};

export const deleteDoctor = async (id: string) => {
  return api.delete(`/api/v1/doctors/${id}`);
};

export type FeaturedDoctorPayload = {
  doctor: string;
};

export type ApiFeaturedDoctorRecord = {
  _id: string;
  doctor: ApiDoctor | string;
  createdAt?: string;
  updatedAt?: string;
};

export type FeaturedDoctorsResponse = {
  success: boolean;
  count: number;
  data: ApiFeaturedDoctorRecord[];
};

export const getFeaturedDoctors = async () => {
  const response = await api.get<FeaturedDoctorsResponse>("/api/v1/featured-doctors");
  return response.data;
};

export const createFeaturedDoctor = async (payload: FeaturedDoctorPayload) => {
  const response = await api.post("/api/v1/featured-doctors", payload);
  return response.data;
};

export const deleteFeaturedDoctor = async (featuredRecordId: string) => {
  const response = await api.delete(`/api/v1/featured-doctors/${featuredRecordId}`);
  return response.data;
};

export const getFeaturedDoctorIds = async (): Promise<Set<string>> => {
  const res = await getFeaturedDoctors();
  const ids = new Set<string>();
  for (const record of res.data ?? []) {
    const doc = record.doctor;
    if (doc && typeof doc === "object" && doc._id) {
      ids.add(String(doc._id));
    } else if (typeof doc === "string") {
      ids.add(doc);
    }
  }
  return ids;
};

export const syncFeaturedDoctors = async (selectedDoctorIds: string[]) => {
  const res = await getFeaturedDoctors();
  const records = res.data ?? [];
  const selectedSet = new Set(selectedDoctorIds);

  const currentByDoctorId = new Map<string, string>();
  for (const record of records) {
    const doc = record.doctor;
    const docId =
      doc && typeof doc === "object" && doc._id ? String(doc._id) : String(doc ?? "");
    if (docId) currentByDoctorId.set(docId, record._id);
  }

  const tasks: Promise<unknown>[] = [];

  for (const doctorId of selectedDoctorIds) {
    if (!currentByDoctorId.has(doctorId)) {
      tasks.push(createFeaturedDoctor({ doctor: doctorId }));
    }
  }

  for (const [docId, featuredId] of currentByDoctorId) {
    if (!selectedSet.has(docId)) {
      tasks.push(deleteFeaturedDoctor(featuredId));
    }
  }

  await Promise.all(tasks);
};

export const mapFeaturedToListItem = (record: ApiFeaturedDoctorRecord): DoctorListItem | null => {
  const doc = record.doctor;
  if (!doc || typeof doc !== "object" || !doc._id) return null;
  return mapApiDoctorToListItem(doc as ApiDoctor, new Set([String(doc._id)]));
};
