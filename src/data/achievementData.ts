import type { ApiAchievement } from "@/api/achievement";

/** Static seed data (reference / fallback display shape). */
export const achievementData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rangaa Tara Mahawan",
    title: "Bell Man - Guest Relations",
    department: "Guest Relation Department",
    division: "Hospitality Division",
    month: "April",
    achievement: [
      "Rangaa has earned this recognition through his exceptional helpfulness and a consistently positive attitude.",
      "A dependable team member with an exemplary attendance record, he ensures that our guests' first impression of Royale Hayat is one of comfort and high-standard hospitality.",
      "Dependable and dedicated team member who works harmoniously with others.",
      "He is reliable, always willing to extend his duty when needed, and completes tasks efficiently without complaint.",
      "Attentive in the lobby and consistently respectful, he is a valued part of the team.",
    ],
    image: "https://royal-hayat.s3.eu-central-1.amazonaws.com/employee-of-the-month/ranga-tara.jpeg",
    publicationStatus: "Publish",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Mohammad Niyaz Salam",
    title: "Guest Services Operator - Call Center",
    department: "Call Center Department",
    division: "Hospitality Division",
    month: "April",
    achievement: [
      "Mohammad distinguishes himself through efficiency and a commitment to service excellence.",
      "His professional handling of guest inquiries, combined with his reliable attendance and disciplined work ethic, has been essential to the success of our Guest Services team.",
      "Highly reliable and flexible team member who always brings positive energy and support to the workplace.",
      "He consistently completes tasks on time and never hesitates to step in when needed.",
      "Even when covering shifts at short notice, he maintains excellent performance standards.",
    ],
    image: "https://royal-hayat.s3.eu-central-1.amazonaws.com/employee-of-the-month/mohammad-niyaz.jpeg",
    publicationStatus: "Publish",
  },
];

export type AchievementStatus = "published" | "draft";

export type Achievement = {
  id: string;
  employeeId: string;
  employeeName: string;
  arabicEmployeeName: string;
  title: string;
  arabicTitle: string;
  description: string;
  arabicDescription: string;
  descriptionLines: string[];
  department: string;
  arabicDepartment: string;
  division: string;
  arabicDivision: string;
  date: string;
  month?: string;
  status: AchievementStatus;
  image?: string;
  createdAt: string;
  updatedAt?: string;
};

export const visibilityToStatus = (
  visibility: "show" | "hide"
): AchievementStatus => (visibility === "show" ? "published" : "draft");

export const statusToVisibility = (
  status: AchievementStatus
): "show" | "hide" => (status === "published" ? "show" : "hide");

export const achievementsTextToLines = (text: string): string[] =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

export const linesToAchievementsText = (lines: string[] | string): string => {
  if (typeof lines === "string") return lines.trim();
  return lines.filter((l) => l.trim()).join("\n");
};

export const mapApiToAchievement = (api: ApiAchievement): Achievement => {
  const description = api.achievements ?? "";
  const arabicDescription = api.arabicAchievements ?? description;
  return {
    id: api._id,
    employeeId: api.employeeId || api.employeeID || "",
    employeeName: api.employeeName,
    arabicEmployeeName: api.employeeNameArabic || api.employeeName,
    title: api.title,
    arabicTitle: api.arabicTitle || api.title,
    description,
    arabicDescription,
    descriptionLines: achievementsTextToLines(description),
    department: api.department ?? "",
    arabicDepartment: api.arabicDepartment ?? api.department ?? "",
    division: "",
    arabicDivision: "",
    date: api.createdAt,
    status: visibilityToStatus(api.visibilityStatus),
    image: api.image,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
};

export type AchievementFormPayload = {
  employeeId: string;
  employeeID?: string;
  employeeName: string;
  employeeNameArabic?: string;
  department?: string;
  arabicDepartment?: string;
  title: string;
  arabicTitle?: string;
  achievements: string;
  arabicAchievements?: string;
  visibilityStatus: "show" | "hide";
  imageFile?: File | null;
};

export const buildAchievementFormData = (payload: AchievementFormPayload): FormData => {
  const formData = new FormData();
  formData.append("employeeId", payload.employeeId.trim());
  formData.append("employeeID", (payload.employeeID || payload.employeeId).trim());
  formData.append("employeeName", payload.employeeName.trim());
  if (payload.employeeNameArabic?.trim()) {
    formData.append("employeeNameArabic", payload.employeeNameArabic.trim());
  }
  formData.append("title", payload.title.trim());
  if (payload.arabicTitle?.trim()) {
    formData.append("arabicTitle", payload.arabicTitle.trim());
  }
  formData.append("achievements", payload.achievements.trim());
  if (payload.arabicAchievements?.trim()) {
    formData.append("arabicAchievements", payload.arabicAchievements.trim());
  }
  formData.append("visibilityStatus", payload.visibilityStatus);
  if (payload.department?.trim()) {
    formData.append("department", payload.department.trim());
  }
  if (payload.arabicDepartment?.trim()) {
    formData.append("arabicDepartment", payload.arabicDepartment.trim());
  }
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }
  return formData;
};
