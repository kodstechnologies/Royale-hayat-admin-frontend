type DoctorSearchFields = {
  name: string;
  arabicName?: string;
  initials: string;
  specialty?: string;
  specialtyAr?: string;
  title?: string;
};

export const extractCombinedInitials = (text: string): string =>
  text
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const getDoctorCombinedInitialsVariants = (
  initials: string,
  name: string,
): string[] => {
  const variants = new Set<string>();
  const trimmedName = name.trim();
  const trimmedInitials = initials.trim();

  const add = (text: string) => {
    const value = extractCombinedInitials(text);
    if (value) variants.add(value);
  };

  if (trimmedName) add(trimmedName);
  if (trimmedInitials) {
    add(trimmedInitials);
    if (trimmedName) add(`${trimmedInitials} ${trimmedName}`);
  }

  return [...variants];
};

export const matchesDoctorSearch = (doctor: DoctorSearchFields, query: string): boolean => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return true;

  const lower = trimmed.toLowerCase();
  const compact = trimmed.replace(/[\s.]/g, "").toUpperCase();

  const textFields = [
    doctor.name,
    doctor.arabicName,
    doctor.initials,
    doctor.specialty,
    doctor.specialtyAr,
    doctor.title,
  ].filter(Boolean) as string[];

  if (textFields.some((field) => field.toLowerCase().includes(lower))) {
    return true;
  }

  if (compact.length >= 2) {
    const englishVariants = getDoctorCombinedInitialsVariants(doctor.initials, doctor.name);
    if (englishVariants.some((variant) => variant.startsWith(compact))) {
      return true;
    }

    if (doctor.arabicName) {
      const arabicVariants = getDoctorCombinedInitialsVariants("", doctor.arabicName);
      if (arabicVariants.some((variant) => variant.startsWith(compact))) {
        return true;
      }
    }
  }

  return false;
};
