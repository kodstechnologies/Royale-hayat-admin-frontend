type DoctorNameFields = { name: string; arabicName: string };

const FEMALE_DOCTOR_FIRST_NAMES = new Set([
  "alia", "anood", "brook", "elizabeth", "elisavet", "eman", "fatemah", "fatima",
  "fariba", "hafsah", "helen", "khalida", "lobna", "maha", "mirvat", "mona",
  "musheera", "nada", "najat", "noha", "nourah", "samar", "salma", "sanketa",
  "sarah", "wasmi", "wadha", "yassmin", "yasmin", "yomna", "zeinab", "anny",
]);

export const isDoctorWithDrTitle = (name: string) =>
  /^(dr|prof|professor)\.?\s/i.test(name.trim());

export const hasArabicDoctorPrefix = (nameAr: string) =>
  /(?:^|\s)(?:د\.?\s|الدكتور\s|الدكتورة\s|البروفيسور\s+د\.?\s*)/u.test(nameAr.trim());

const stripEnglishTitle = (name: string) =>
  name.replace(/^(dr|prof|professor)\.?\s+/i, "").trim();

const isLikelyFemaleDoctorName = (englishName: string) => {
  const first = stripEnglishTitle(englishName).split(/\s+/)[0]?.toLowerCase() ?? "";
  return FEMALE_DOCTOR_FIRST_NAMES.has(first);
};

const getArabicDoctorPrefix = (englishName: string) => {
  if (/^prof/i.test(englishName.trim())) return "البروفيسور د.";
  if (isLikelyFemaleDoctorName(englishName)) return "الدكتورة";
  return "الدكتور";
};

export const formatDoctorDisplayNameAr = (doc: DoctorNameFields) => {
  const nameAr = doc.arabicName.trim();
  if (!isDoctorWithDrTitle(doc.name)) return nameAr;
  if (hasArabicDoctorPrefix(nameAr)) return nameAr;
  return `${getArabicDoctorPrefix(doc.name)} ${nameAr}`;
};
