type DoctorSearchFields = {
  name: string;
  arabicName?: string;
  specialty?: string;
  specialtyAr?: string;
  title?: string;
  department?: string | { name?: string; arabicName?: string };
};

const TATWEEL = /\u0640/g;
const DIACRITICS = /[\u064B-\u065F\u0670]/g;
const ALEF_VARIANTS = /[أإآٱا]/g;
const ALEF_MAKSURA = /ى/g;
const DOCTOR_PREFIX = /^(?:د\.?|dr\.?|prof\.?|professor)\s*/i;

export const normalizeSearchText = (value: string): string =>
  String(value || "")
    .normalize("NFKC")
    .replace(TATWEEL, "")
    .replace(DIACRITICS, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(ALEF_MAKSURA, "ي")
    .replace(DOCTOR_PREFIX, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const resolveDepartmentText = (
  department: DoctorSearchFields["department"],
): string => {
  if (!department) return "";
  if (typeof department === "string") return department;
  return [department.name, department.arabicName].filter(Boolean).join(" ");
};

const tokenizeSearchQuery = (query: string): string[] => {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
};

const buildDoctorSearchHaystack = (doctor: DoctorSearchFields): string =>
  normalizeSearchText(
    [
      doctor.name,
      doctor.arabicName,
      doctor.specialty,
      doctor.specialtyAr,
      doctor.title,
      resolveDepartmentText(doctor.department),
    ].join(" "),
  );

export const extractCombinedInitials = (text: string): string =>
  normalizeSearchText(text)
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const getDoctorCombinedInitialsVariants = (name: string): string[] => {
  const trimmedName = name.trim();
  if (!trimmedName) return [];

  const value = extractCombinedInitials(trimmedName);
  return value ? [value] : [];
};

const matchesCombinedInitials = (doctor: DoctorSearchFields, query: string): boolean => {
  const compact = query.trim().replace(/[\s.]/g, "").toUpperCase();
  if (compact.length < 2 || !/^[\p{L}]+$/u.test(compact)) return false;

  const englishInitials = extractCombinedInitials(doctor.name);
  if (englishInitials.startsWith(compact)) return true;

  if (doctor.arabicName) {
    const arabicInitials = extractCombinedInitials(doctor.arabicName);
    if (arabicInitials.startsWith(compact)) return true;
  }

  return false;
};

export const matchesDoctorSearch = (doctor: DoctorSearchFields, query: string): boolean => {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return true;

  const haystack = buildDoctorSearchHaystack(doctor);
  if (tokens.every((token) => haystack.includes(token))) {
    return true;
  }

  return matchesCombinedInitials(doctor, query);
};
