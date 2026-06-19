export type DoctorEditReturnTo = "list" | "view";

export type DoctorEditLocationState = {
  returnTo?: DoctorEditReturnTo;
};

export const getDoctorEditBackPath = (
  doctorId: string | undefined,
  state: DoctorEditLocationState | null | undefined,
): string => {
  if (state?.returnTo === "view" && doctorId) {
    return `/doctors/view/${doctorId}`;
  }
  return "/doctors";
};

export const getDoctorEditBackLabel = (
  state: DoctorEditLocationState | null | undefined,
): string => (state?.returnTo === "view" ? "Back to Doctor" : "Back to Doctors");
