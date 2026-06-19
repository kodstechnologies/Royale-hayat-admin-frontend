export const DOCTOR_LIST_SEPARATOR = "|||";

export const toItems = (value: string) =>
  value.split(DOCTOR_LIST_SEPARATOR).map((v) => v.trim()).filter(Boolean);

export const itemsToString = (items: string[]) => items.join(DOCTOR_LIST_SEPARATOR);

export type DeptSubspecialityOption = {
  _id: string;
  name: string;
  arabicName: string;
};

export type ExpertiseSectionForm = {
  id?: string;
  subHeading: string;
  subHeadingAr: string;
  points: string[];
  pointsAr: string[];
};

export const createEmptyExpertiseSection = (): ExpertiseSectionForm => ({
  subHeading: "",
  subHeadingAr: "",
  points: [""],
  pointsAr: [""],
});

export const isExpertiseSectionHeading = (value: string) =>
  /[:：]\s*$/.test(String(value ?? "").trim());

const stripHeadingColon = (value: string) =>
  String(value ?? "").trim().replace(/[:：]\s*$/, "");

const normalizePointRows = (rows: string[]) => {
  const trimmed = rows.map((row) => String(row).trim());
  return trimmed.length ? trimmed : [""];
};

const promoteLeadingHeading = (heading: string, rows: string[]) => {
  if (heading.trim()) {
    return { heading: heading.trim(), rows: normalizePointRows(rows) };
  }

  const trimmedRows = rows.map((row) => String(row).trim());
  const firstNonEmptyIndex = trimmedRows.findIndex(Boolean);
  if (firstNonEmptyIndex === -1) {
    return { heading: "", rows: [""] };
  }

  const first = trimmedRows[firstNonEmptyIndex];
  if (!isExpertiseSectionHeading(first)) {
    return { heading: "", rows: normalizePointRows(rows) };
  }

  const remaining = trimmedRows.slice(firstNonEmptyIndex + 1);

  return {
    heading: first.trim(),
    rows: remaining.length ? remaining : [""],
  };
};

const dedupeHeadingFromPoints = (heading: string, points: string[]) => {
  const normalizedHeading = stripHeadingColon(heading).toLowerCase();
  if (!normalizedHeading) {
    return points.map((point) => point.trim()).filter(Boolean);
  }

  return points
    .map((point) => point.trim())
    .filter((point) => {
      if (!point) return false;
      return stripHeadingColon(point).toLowerCase() !== normalizedHeading;
    });
};

export const normalizeExpertiseSectionForForm = (
  section: ExpertiseSectionForm,
): ExpertiseSectionForm => {
  const english = promoteLeadingHeading(section.subHeading, section.points);
  const arabic = promoteLeadingHeading(section.subHeadingAr, section.pointsAr);

  return {
    ...(section.id ? { id: section.id } : {}),
    subHeading: english.heading,
    subHeadingAr: arabic.heading,
    points: english.rows,
    pointsAr: arabic.rows,
  };
};

export type DoctorFormValues = {
  doctorId: string;
  name: string;
  title: string;
  languages: string;
  expertiseSections: ExpertiseSectionForm[];
  qualifications: string;
  arabicName: string;
  arabicTitle: string;
  arabicLanguages: string;
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
): FormData => {
  const selectedSubs = deptSubspecialities.filter((sub) =>
    values.subspecialityIds.some((id) => String(id) === String(sub._id)),
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

  appendJsonArray(formData, "subspecialities", selectedSubs.map((s) => s.name));
  appendJsonArray(formData, "subspecialitiesAr", selectedSubs.map((s) => s.arabicName));
  appendJsonArray(formData, "qualifications", toItems(values.qualifications));
  appendJsonArray(formData, "qualificationsAr", toItems(values.arabicQualifications));

  const expertisePayload = values.expertiseSections
    .map((section) => {
      const subHeading = section.subHeading.trim();
      const subHeadingAr = section.subHeadingAr.trim();
      const points = dedupeHeadingFromPoints(subHeading, section.points);
      const pointsAr = dedupeHeadingFromPoints(subHeadingAr, section.pointsAr);
      const sectionId =
        section.id && /^[0-9a-fA-F]{24}$/i.test(section.id) ? section.id : undefined;

      return {
        ...(sectionId ? { id: sectionId, _id: sectionId } : {}),
        subHeading,
        subHeadingAr,
        points,
        pointsAr,
      };
    })
    .filter(
      (section) =>
        section.subHeading ||
        section.subHeadingAr ||
        section.points.length > 0 ||
        section.pointsAr.length > 0,
    );

  formData.append("expertise", JSON.stringify(expertisePayload));

  appendJsonArray(formData, "languages", toItems(values.languages));
  appendJsonArray(formData, "languagesAr", toItems(values.arabicLanguages));

  if (values.imageFile) {
    formData.append("image", values.imageFile);
  }

  return formData;
};
