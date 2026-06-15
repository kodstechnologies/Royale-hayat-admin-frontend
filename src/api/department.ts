import api from "./axiosInstance";
export type Department = {
  _id: string;
  departmentId?: string;
  name?: string;
  arabicName?: string;
  description?: string;
  arabicDescription?: string;
  medicalField?: string;
  medicalFieldAr?: string;
  catagory?: string | any;
  subspecialities?: any[];
  image?: string;
  subSpecialties?: string[];
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  customExplainantions?: any[];
};
export type DepartmentPayload = {
  departmentId: string;
  name: string;
  description: string;
  catagory?: string;
  subspecialities?: string[];
  image?: string;
  subSpecialties: string[];
  isActive?: boolean;
  order?: number;
};

export const createDepartment = async (payload: DepartmentPayload | FormData) => {
  if (payload instanceof FormData) {
    return api.post("/api/v1/departments", payload);
  }
  return api.post("/api/v1/departments", payload);
};

export type CreateDepartmentFormPayload = {
  departmentId: string;
  name: string;
  description: string;
  arabicName: string;
  arabicDescription: string;
  medicalField?: string;
  medicalFieldAr?: string;
  catagoryId: string;
  isActive: boolean;
  order: number;
  imageFile: File | null;
  customExplainantions: {
    heading: string;
    subHeading: string;
    explaination: string[];
    arabicHeading: string;
    arabicSubHeading: string;
    arabicExplaination: string[];
  }[];
};

export const buildDepartmentFormData = (values: CreateDepartmentFormPayload): FormData => {
  const formData = new FormData();

  formData.append("departmentId", values.departmentId.trim());
  formData.append("name", values.name.trim());
  formData.append("description", values.description.trim());
  formData.append("arabicName", values.arabicName.trim());
  formData.append("arabicDescription", values.arabicDescription.trim());
  formData.append("medicalField", (values.medicalField ?? "").trim());
  formData.append("medicalFieldAr", (values.medicalFieldAr ?? "").trim());
  formData.append("catagory", values.catagoryId);
  formData.append("isActive", String(values.isActive));
  formData.append("order", String(values.order ?? 0));

  if (values.imageFile) {
    formData.append("image", values.imageFile);
  }

  const normalizedCustomExplainantions = values.customExplainantions
    .map((section) => ({
      heading: section.heading.trim(),
      subHeading: section.subHeading.trim(),
      explaination: section.explaination.map((line) => line.trim()).filter(Boolean),
      arabicHeading: section.arabicHeading.trim(),
      arabicSubHeading: section.arabicSubHeading.trim(),
      arabicExplaination: section.arabicExplaination.map((line) => line.trim()).filter(Boolean),
    }))
    .filter(
      (section) =>
        section.heading.length > 0 ||
        section.subHeading.length > 0 ||
        section.explaination.length > 0 ||
        section.arabicHeading.length > 0 ||
        section.arabicSubHeading.length > 0 ||
        section.arabicExplaination.length > 0,
    );

  formData.append("customExplainantions", JSON.stringify(normalizedCustomExplainantions));

  return formData;
};

export type DepartmentListItem = {
  _id: string;
  departmentId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  order: number;
};

export type DepartmentDetail = DepartmentListItem & {
  medicalField?: string;
  medicalFieldAr?: string;
  customExplainantions?: {
    _id?: string;
    id?: string;
    heading?: string;
    subHeading?: string;
    arabicHeading?: string;
    arabicSubHeading?: string;
    explaination?: string[];
    arabicExplaination?: string[];
  }[];
};

export const DEPARTMENT_CATEGORY_NAMES = [
  "CLINICAL SPECIALITY",
  "CLINICAL SUPPORT SERVICE",
  "HOME CARE SERVICE",
] as const;

const CATEGORY_NAME_ALIASES: Record<
  string,
  (typeof DEPARTMENT_CATEGORY_NAMES)[number]
> = {
  "clinical speciality": "CLINICAL SPECIALITY",
  "clinical support service": "CLINICAL SUPPORT SERVICE",
  "home care service": "HOME CARE SERVICE",
};

export const normalizeDepartmentCategory = (name: string): string => {
  const key = name.trim().toLowerCase();
  return CATEGORY_NAME_ALIASES[key] ?? name.trim();
};

const resolveCategoryName = (catagory: unknown): string => {
  if (catagory && typeof catagory === "object" && "name" in catagory) {
    const name = (catagory as { name?: string }).name;
    if (typeof name === "string" && name.trim()) {
      return normalizeDepartmentCategory(name);
    }
  }
  if (typeof catagory === "string" && catagory.trim()) {
    return normalizeDepartmentCategory(catagory);
  }
  return "CLINICAL SPECIALITY";
};

export const mapApiDepartmentToListItem = (row: Department): DepartmentListItem => ({
  _id: String(row._id ?? ""),
  departmentId: String(row.departmentId ?? ""),
  name: String(row.name ?? ""),
  nameAr: String(row.arabicName ?? row.name ?? ""),
  description: String(row.description ?? ""),
  descriptionAr: String(row.arabicDescription ?? row.description ?? ""),
  image: row.image,
  category: resolveCategoryName(row.catagory),
  createdAt: String(row.createdAt ?? ""),
  updatedAt: String(row.updatedAt ?? ""),
  isActive: row.isActive !== false,
  order: typeof row.order === "number" ? row.order : 0,
});

export const mapApiDepartmentToDetail = (row: Department): DepartmentDetail => ({
  ...mapApiDepartmentToListItem(row),
  medicalField: String(row.medicalField ?? "").trim() || undefined,
  medicalFieldAr: String(row.medicalFieldAr ?? "").trim() || undefined,
  customExplainantions: Array.isArray(row.customExplainantions)
    ? row.customExplainantions
    : [],
});

export type EditDepartmentFormValues = {
  departmentId: string;
  name: string;
  description: string;
  arabicName: string;
  arabicDescription: string;
  medicalField: string;
  medicalFieldAr: string;
  catagoryId: string;
  imageFile: File | null;
  isActive: boolean;
  order: number;
  customSections: {
    id: string;
    heading: string;
    subHeading: string;
    explaination: string[];
    arabicHeading: string;
    arabicSubHeading: string;
    arabicExplaination: string[];
  }[];
};

const resolveCategoryId = (catagory: unknown): string => {
  if (catagory && typeof catagory === "object" && "_id" in catagory) {
    return String((catagory as { _id?: string })._id ?? "");
  }
  if (typeof catagory === "string" && catagory.trim()) {
    return catagory.trim();
  }
  return "";
};

const resolveCategoryNameForMatch = (catagory: unknown): string | null => {
  if (catagory && typeof catagory === "object" && "name" in catagory) {
    const name = (catagory as { name?: string }).name;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  }
  if (typeof catagory === "string" && catagory.trim()) {
    return catagory.trim();
  }
  return null;
};

export const mapApiDepartmentToEditForm = (
  row: Department,
): {
  values: EditDepartmentFormValues;
  categoryNameForMatch: string | null;
  imageUrl: string;
} => {
  const customSections = Array.isArray(row.customExplainantions)
    ? row.customExplainantions.map((section, idx) => {
        const legacySubHeading = String(section.subHeading ?? "");
        const heading = String(section.heading ?? "");
        const hasHeading = heading.length > 0;
        const legacyArabicSubHeading = String(section.arabicSubHeading ?? "");
        const arabicHeading = String(section.arabicHeading ?? "");
        const hasArabicHeading = arabicHeading.length > 0;

        return {
        id: String(section._id ?? section.id ?? `${Date.now()}-${idx}`),
        heading: hasHeading ? heading : legacySubHeading,
        subHeading: hasHeading ? legacySubHeading : "",
        explaination:
          Array.isArray(section.explaination) && section.explaination.length > 0
            ? section.explaination.map(String)
            : [""],
        arabicHeading: hasArabicHeading ? arabicHeading : legacyArabicSubHeading,
        arabicSubHeading: hasArabicHeading ? legacyArabicSubHeading : "",
        arabicExplaination:
          Array.isArray(section.arabicExplaination) &&
          section.arabicExplaination.length > 0
            ? section.arabicExplaination.map(String)
            : [""],
      };
      })
    : [];

  return {
    values: {
      departmentId: String(row.departmentId ?? ""),
      name: String(row.name ?? ""),
      description: String(row.description ?? ""),
      arabicName: String(row.arabicName ?? row.name ?? ""),
      arabicDescription: String(row.arabicDescription ?? row.description ?? ""),
      medicalField: String(row.medicalField ?? ""),
      medicalFieldAr: String(row.medicalFieldAr ?? ""),
      catagoryId: resolveCategoryId(row.catagory),
      imageFile: null,
      isActive: row.isActive !== false,
      order: typeof row.order === "number" ? row.order : 0,
      customSections,
    },
    categoryNameForMatch: resolveCategoryNameForMatch(row.catagory),
    imageUrl: String(row.image ?? ""),
  };
};

export const getDepartments = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get("/api/v1/departments", { params });
};

export const getDepartmentById = async (id: string) => {
  return api.get(`/api/v1/departments/${id}`);
};

export const updateDepartment = async (id: string, payload: DepartmentPayload | FormData) => {
  return api.put(`/api/v1/departments/${id}`, payload);
};

export const deleteDepartment = async (id: string) => {
  return api.delete(`/api/v1/departments/${id}`);
};

export const getDoctorsByDepartment = async (department: string) => {
  return api.get("/api/v1/doctors", { params: { department } });
};
