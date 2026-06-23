import api from "./axiosInstance";
import {
  createEmptyExpertiseSection,
  normalizeExpertiseSectionForForm,
  type DeptSubspecialityOption,
  type ExpertiseSectionForm,
} from "@/lib/doctorForm";

export type ApiExpertise = {
  _id?: string;
  subHeading?: string;
  subHeadingAr?: string;
  points?: string[];
  pointsAr?: string[];
};

export type ApiQualifications = ApiExpertise;

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
  qualifications?: ApiQualifications[] | string[];
  expertise?: ApiExpertise[] | string[];
  expertiseAr?: string[];
  languages?: string[];
  languagesAr?: string[];
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
  /** Derived from name for avatar/fallback display — not stored on doctor records */
  initials: string;
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  /** Doctor id used when removing from the featured list. */
  featuredRecordId?: string;
  featuredOrder?: number;
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
  image?: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  isActive: boolean;
};

const deriveInitialsFromName = (name: string): string => {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "DR";
};

const flattenQualifications = (qualifications: ApiDoctor["qualifications"]) => {
  if (!Array.isArray(qualifications)) return [];

  return qualifications.flatMap((item) => {
    if (typeof item === "string") return item.trim() ? [item.trim()] : [];
    const points = Array.isArray(item.points) ? item.points : [];
    const heading = String(item.subHeading || "").trim();
    return [
      ...(heading ? [heading.endsWith(":") ? heading : `${heading}:`] : []),
      ...points.map((point) => String(point).trim()).filter(Boolean),
    ];
  });
};

const flattenQualificationsAr = (row: ApiDoctor) => {
  if (Array.isArray(row.qualifications)) {
    const structured = row.qualifications.every(
      (item) => typeof item === "object" && item !== null,
    );
    if (structured) {
      return (row.qualifications as ApiQualifications[]).flatMap((item) => {
        const points = Array.isArray(item.pointsAr) ? item.pointsAr : [];
        const heading = String(item.subHeadingAr || "").trim();
        return [
          ...(heading ? [heading.endsWith(":") ? heading : `${heading}:`] : []),
          ...points.map((point) => String(point).trim()).filter(Boolean),
        ];
      });
    }
  }

  return flattenQualifications(row.qualifications);
};

const flattenExpertise = (expertise: ApiDoctor["expertise"]) => {
  if (!Array.isArray(expertise)) return [];

  return expertise.flatMap((item) => {
    if (typeof item === "string") return item.trim() ? [item.trim()] : [];
    const points = Array.isArray(item.points) ? item.points : [];
    const heading = String(item.subHeading || "").trim();
    return [
      ...(heading ? [heading.endsWith(":") ? heading : `${heading}:`] : []),
      ...points.map((point) => String(point).trim()).filter(Boolean),
    ];
  });
};

const flattenExpertiseAr = (row: ApiDoctor) => {
  if (Array.isArray(row.expertise)) {
    const structured = row.expertise.every((item) => typeof item === "object" && item !== null);
    if (structured) {
      return (row.expertise as ApiExpertise[]).flatMap((item) => {
        const points = Array.isArray(item.pointsAr) ? item.pointsAr : [];
        const heading = String(item.subHeadingAr || "").trim();
        return [
          ...(heading ? [heading.endsWith(":") ? heading : `${heading}:`] : []),
          ...points.map((point) => String(point).trim()).filter(Boolean),
        ];
      });
    }
  }

  return Array.isArray(row.expertiseAr) ? row.expertiseAr : [];
};

const mapExpertiseToFormSections = (row: ApiDoctor): ExpertiseSectionForm[] => {
  const expertise = row.expertise;

  if (Array.isArray(expertise) && expertise.length > 0) {
    const structured = expertise.every((item) => typeof item === "object" && item !== null);

    if (structured) {
      return (expertise as ApiExpertise[]).map((item) =>
        normalizeExpertiseSectionForForm({
          id: item._id ? String(item._id) : undefined,
          subHeading: String(item.subHeading ?? ""),
          subHeadingAr: String(item.subHeadingAr ?? ""),
          points: item.points?.length ? item.points.map((point) => String(point)) : [""],
          pointsAr: item.pointsAr?.length ? item.pointsAr.map((point) => String(point)) : [""],
        }),
      );
    }

    return [
      normalizeExpertiseSectionForForm({
        subHeading: "",
        subHeadingAr: "",
        points: (expertise as string[]).length
          ? (expertise as string[]).map((point) => String(point))
          : [""],
        pointsAr: row.expertiseAr?.length ? row.expertiseAr.map((point) => String(point)) : [""],
      }),
    ];
  }

  return [createEmptyExpertiseSection()];
};

const resolveDepartment = (department: ApiDoctor["department"]) => {
  if (department && typeof department === "object") {
    return {
      departmentId: String(department._id ?? ""),
      departmentName: String(department.name ?? ""),
      departmentNameAr: String(department.arabicName ?? department.name ?? ""),
    };
  }
  if (typeof department === "string" && department.trim()) {
    return {
      departmentId: department.trim(),
      departmentName: "",
      departmentNameAr: "",
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
    qualifications: flattenQualifications(row.qualifications),
    expertise: flattenExpertise(row.expertise),
    languages: Array.isArray(row.languages) ? row.languages : [],
    initials: deriveInitialsFromName(String(row.name ?? "")),
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
    qualifications: flattenQualifications(row.qualifications),
    arabicQualifications: flattenQualificationsAr(row),
    expertise: flattenExpertise(row.expertise),
    arabicExpertise: flattenExpertiseAr(row),
    languages: Array.isArray(row.languages) ? row.languages : [],
    arabicLanguages: Array.isArray(row.languagesAr) ? row.languagesAr : [],
    availableOnline: row.availableOnline === true,
    image: row.image,
    isActive: row.isActive !== false,
  };
};

export const mapApiDoctorToFormValues = (
  row: ApiDoctor,
  deptSubspecialities: DeptSubspecialityOption[],
) => {
  const dept = resolveDepartment(row.department);
  const subspecialityIds = deptSubspecialities
    .filter(
      (sub) =>
        row.subspecialities?.includes(sub.name) ||
        row.subspecialitiesAr?.includes(sub.arabicName),
    )
    .map((sub) => String(sub._id));

  return {
    doctorId: String(row.doctorId ?? ""),
    name: String(row.name ?? ""),
    title: String(row.title ?? ""),
    languages: (row.languages ?? []).join("|||"),
    expertiseSections: mapExpertiseToFormSections(row),
    qualifications: flattenQualifications(row.qualifications).join("|||"),
    arabicName: String(row.nameAr ?? ""),
    arabicTitle: String(row.titleAr ?? ""),
    arabicLanguages: (row.languagesAr ?? []).join("|||"),
    arabicQualifications: flattenQualificationsAr(row).join("|||"),
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
  return api.put(`/api/v1/doctors/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  order?: number;
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
  const ordered = await getFeaturedDoctorIdsOrdered();
  return new Set(ordered);
};

export const getFeaturedDoctorIdsOrdered = async (): Promise<string[]> => {
  const res = await getFeaturedDoctors();
  const ids: string[] = [];

  for (const record of res.data ?? []) {
    const doc = record.doctor;
    if (doc && typeof doc === 'object' && doc._id) {
      ids.push(String(doc._id));
    } else if (typeof doc === 'string') {
      ids.push(doc);
    }
  }

  return ids;
};

const FEATURED_SYNC_UNAVAILABLE_MESSAGE =
  "Featured doctors sync needs the updated backend. Use http://localhost:8000 for local dev, or deploy the latest Royal-hayat-Backend to production.";

const throwFeaturedSyncError = (message: string): never => {
  const err = new Error(message) as Error & {
    response?: { data?: { message?: string } };
  };
  err.response = { data: { message } };
  throw err;
};

const legacySyncFeaturedDoctors = async (selectedDoctorIds: string[]) => {
  const res = await getFeaturedDoctors();
  const records = res.data ?? [];

  for (const record of records) {
    try {
      await deleteFeaturedDoctor(record._id);
    } catch {
      const doc = record.doctor;
      if (doc && typeof doc === "object" && doc._id) {
        await deleteFeaturedDoctor(String(doc._id));
      }
    }
  }

  for (const doctorId of selectedDoctorIds) {
    try {
      await createFeaturedDoctor({ doctor: doctorId });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 500 && selectedDoctorIds.length > 1) {
        throwFeaturedSyncError(FEATURED_SYNC_UNAVAILABLE_MESSAGE);
      }
      throw error;
    }
  }
};

export const syncFeaturedDoctors = async (selectedDoctorIds: string[]) => {
  const payload = { doctorIds: selectedDoctorIds };
  const attempts = [
    () => api.post("/api/v1/featured-doctors/sync", payload),
    () => api.put("/api/v1/featured-doctors", payload),
  ];

  let syncUnavailable = false;
  for (const attempt of attempts) {
    try {
      const response = await attempt();
      return response.data;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) {
        syncUnavailable = true;
        continue;
      }
      throw error;
    }
  }

  if (syncUnavailable && selectedDoctorIds.length > 1) {
    throwFeaturedSyncError(FEATURED_SYNC_UNAVAILABLE_MESSAGE);
  }

  await legacySyncFeaturedDoctors(selectedDoctorIds);
  return getFeaturedDoctors();
};

export const mapFeaturedToListItem = (record: ApiFeaturedDoctorRecord): DoctorListItem | null => {
  const doc = record.doctor;
  if (!doc || typeof doc !== 'object' || !doc._id) return null;
  return {
    ...mapApiDoctorToListItem(doc as ApiDoctor, new Set([String(doc._id)])),
    featuredRecordId: String(doc._id),
    featuredOrder: record.order,
  };
};
