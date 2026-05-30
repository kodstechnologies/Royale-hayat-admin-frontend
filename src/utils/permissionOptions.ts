import { PERMISSIONS } from "@/constants/permissions";

export type PermissionOption = {
  key: string;
  label: string;
};

/** Human-readable label from permission string e.g. `doctor.create` → `Doctor Create` */
export const formatPermissionLabel = (permissionKey: string): string =>
  permissionKey
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/** All permissions from constants — no hardcoded list */
export const getAllPermissionOptions = (): PermissionOption[] =>
  Object.values(PERMISSIONS).map((key) => ({
    key,
    label: formatPermissionLabel(key),
  }));
