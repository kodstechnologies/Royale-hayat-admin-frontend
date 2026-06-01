import { PERMISSIONS } from "@/constants/permissions";

const ALL_PERMISSION_VALUES = new Set(Object.values(PERMISSIONS));

const ACTIONS_REQUIRING_VIEW = new Set([
  "create",
  "update",
  "delete",
  "accept",
  "reject",
  "add",
]);

const isViewPermission = (key: string): boolean => {
  if (key.endsWith(".view")) return true;
  if (key.endsWith(".view.all")) return true;
  return false;
};

export const getRequiredViewPermission = (
  permissionKey: string,
): string | null => {
  if (isViewPermission(permissionKey)) return null;

  if (permissionKey.includes(".share.")) {
    const base = permissionKey.split(".share.")[0];
    const viewKey = `${base}.view`;
    return ALL_PERMISSION_VALUES.has(viewKey) ? viewKey : null;
  }

  const parts = permissionKey.split(".");
  const action = parts[parts.length - 1];

  if (!ACTIONS_REQUIRING_VIEW.has(action)) return null;

  const viewKey = [...parts.slice(0, -1), "view"].join(".");
  return ALL_PERMISSION_VALUES.has(viewKey) ? viewKey : null;
};

export const applyViewPermissionRules = (permissions: string[]): string[] => {
  const next = new Set(permissions);

  for (const key of permissions) {
    const viewKey = getRequiredViewPermission(key);
    if (viewKey) next.add(viewKey);
  }

  return Array.from(next);
};

const hasDependentPermissions = (
  permissions: string[],
  viewKey: string,
): boolean =>
  permissions.some(
    (key) => key !== viewKey && getRequiredViewPermission(key) === viewKey,
  );

export const togglePermissionSelection = (
  current: string[],
  key: string,
): string[] => {
  const isSelected = current.includes(key);

  if (isSelected) {
    if (isViewPermission(key) && hasDependentPermissions(current, key)) {
      return current;
    }
    return applyViewPermissionRules(current.filter((p) => p !== key));
  }

  return applyViewPermissionRules([...current, key]);
};

export const mergePermissionSelection = (
  current: string[],
  keysToAdd: string[],
): string[] => applyViewPermissionRules([...new Set([...current, ...keysToAdd])]);

export const removePermissionSelection = (
  current: string[],
  keysToRemove: string[],
): string[] => {
  const removeSet = new Set(keysToRemove);
  return applyViewPermissionRules(current.filter((p) => !removeSet.has(p)));
};
