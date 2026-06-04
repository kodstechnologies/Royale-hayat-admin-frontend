export const DOCTOR_LIST_SEPARATOR = "|||";

export const toItems = (value: string) =>
  value.split(DOCTOR_LIST_SEPARATOR).map((v) => v.trim()).filter(Boolean);

export const itemsToString = (items: string[]) => items.join(DOCTOR_LIST_SEPARATOR);

export type DeptSubspecialityOption = {
  _id: string;
  name: string;
  arabicName: string;
};

export type DoctorFormValues = {
  doctorId: string;
  name: string;
  title: string;
  initials: string;
  languages: string;
  expertise: string;
  qualifications: string;
  arabicName: string;
  arabicTitle: string;
  arabicInitials: string;
  arabicLanguages: string;
  arabicExpertise: string;
  arabicQualifications: string;
  department: string;
  subspecialityIds: string[];
  availableOnline: boolean;
  imageFile: File | null;
};

const appendJsonArray = (formData: FormData, key: string, values: string[]) => {
  formData.append(key, JSON.stringify(values));
};

export const buildDoctorFormData = (
  values: DoctorFormValues,
  deptSubspecialities: DeptSubspecialityOption[],
  options?: { existingImageUrl?: string },
): FormData => {
  const selectedSubs = deptSubspecialities.filter((sub) =>
    values.subspecialityIds.includes(sub._id),
  );

  const formData = new FormData();
  formData.append("doctorId", values.doctorId.trim());
  formData.append("name", values.name.trim());
  formData.append("nameAr", values.arabicName.trim());
  formData.append("department", values.department.trim());
  formData.append("availableOnline", String(values.availableOnline));
  formData.append("isActive", "true");

  if (values.title.trim()) formData.append("title", values.title.trim());
  if (values.arabicTitle.trim()) formData.append("titleAr", values.arabicTitle.trim());
  if (values.initials.trim()) formData.append("initials", values.initials.trim());
  if (values.arabicInitials.trim()) {
    formData.append("initialsAr", values.arabicInitials.trim());
  } else if (values.initials.trim()) {
    formData.append("initialsAr", "د.");
  }

  appendJsonArray(formData, "subspecialities", selectedSubs.map((s) => s.name));
  appendJsonArray(formData, "subspecialitiesAr", selectedSubs.map((s) => s.arabicName));
  appendJsonArray(formData, "qualifications", toItems(values.qualifications));
  appendJsonArray(formData, "qualificationsAr", toItems(values.arabicQualifications));
  appendJsonArray(formData, "expertise", toItems(values.expertise));
  appendJsonArray(formData, "expertiseAr", toItems(values.arabicExpertise));
  appendJsonArray(formData, "languages", toItems(values.languages));
  appendJsonArray(formData, "languagesAr", toItems(values.arabicLanguages));

  if (values.imageFile) {
    formData.append("image", values.imageFile);
  } else if (options?.existingImageUrl) {
    formData.append("image", options.existingImageUrl);
  }

  return formData;
};
