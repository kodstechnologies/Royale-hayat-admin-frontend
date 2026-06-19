const TITLE_PREFIX = /^(?:dr|prof|professor)\.?\s+/i;

export const stripDoctorTitlePrefix = (name: string): string => {
  let result = String(name ?? "").trim();

  while (TITLE_PREFIX.test(result)) {
    result = result.replace(TITLE_PREFIX, "").trim();
  }

  return result;
};

export const getDoctorAlphabeticalSortKey = (name: string): string =>
  stripDoctorTitlePrefix(name).toLowerCase();

export const compareDoctorNamesAlphabetically = (nameA: string, nameB: string): number =>
  getDoctorAlphabeticalSortKey(nameA).localeCompare(getDoctorAlphabeticalSortKey(nameB), undefined, {
    sensitivity: "base",
  });

export const sortDoctorsAlphabetically = <T extends { name: string }>(doctors: T[]): T[] =>
  [...doctors].sort((a, b) => compareDoctorNamesAlphabetically(a.name, b.name));
