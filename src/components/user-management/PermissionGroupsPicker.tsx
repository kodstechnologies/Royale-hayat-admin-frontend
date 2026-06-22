import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupedPermissionOptions } from "@/utils/permissionOptions";
import {
  getRequiredViewPermission,
  mergePermissionSelection,
  removePermissionSelection,
  togglePermissionSelection,
} from "@/utils/permissionSelection";

type PermissionGroupsPickerProps = {
  selectedPermissions: string[];
  onSelectionChange: (permissions: string[]) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

/** Categories, departments, subspecialities: assign view and delete in user management. */
const LIMITED_PERMISSION_GROUP_IDS = new Set([
  "categories",
  "departments",
  "subspecialities",
]);

const isViewPermissionKey = (key: string): boolean =>
  key.endsWith(".view") || key.endsWith(".view.all");

const isViewOrDeletePermissionKey = (key: string): boolean =>
  isViewPermissionKey(key) || key.endsWith(".delete");

const getAssignableGroupPermissions = (
  groupId: string,
  permissions: { key: string; label: string }[],
) => {
  if (!LIMITED_PERMISSION_GROUP_IDS.has(groupId)) return permissions;
  return permissions.filter((permission) =>
    isViewOrDeletePermissionKey(permission.key),
  );
};

const PermissionGroupsPicker = ({
  selectedPermissions,
  onSelectionChange,
  onSelectAll,
  onClearAll,
}: PermissionGroupsPickerProps) => {
  const permissionGroups = getGroupedPermissionOptions();

  const toggleSection = (sectionKeys: string[]) => {
    const allSelected = sectionKeys.every((key) =>
      selectedPermissions.includes(key),
    );

    if (allSelected) {
      onSelectionChange(
        removePermissionSelection(selectedPermissions, sectionKeys),
      );
    } else {
      onSelectionChange(
        mergePermissionSelection(selectedPermissions, sectionKeys),
      );
    }
  };

  const isViewLocked = (permissionKey: string): boolean => {
    if (!isViewPermissionKey(permissionKey)) return false;
    return selectedPermissions.some(
      (key) =>
        key !== permissionKey &&
        getRequiredViewPermission(key) === permissionKey,
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-burgundy" />
          <h5 className="text-sm font-semibold text-slate-700">Permissions</h5>
          <span className="text-xs text-slate-500">
            ({selectedPermissions.length} selected)
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="h-8 text-xs"
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {permissionGroups.map((group) => {
          const visiblePermissions = getAssignableGroupPermissions(
            group.id,
            group.permissions,
          );
          const sectionKeys = visiblePermissions.map((p) => p.key);
          const selectedInSection = sectionKeys.filter((key) =>
            selectedPermissions.includes(key),
          ).length;
          const allSectionSelected =
            sectionKeys.length > 0 &&
            selectedInSection === sectionKeys.length;

          if (visiblePermissions.length === 0) return null;

          return (
            <section
              key={group.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/90 px-4 py-3 border-b border-slate-200">
                <div>
                  <h6 className="text-sm font-semibold text-slate-800">
                    {group.title}
                  </h6>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedInSection} of {sectionKeys.length} selected
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection(sectionKeys)}
                  className="h-8 text-xs text-burgundy hover:text-burgundy hover:bg-burgundy/10"
                >
                  {allSectionSelected ? "Deselect section" : "Select section"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                {visiblePermissions.map((permission) => {
                  const viewLocked = isViewLocked(permission.key);

                  return (
                    <label
                      key={permission.key}
                      className={`flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2 transition-colors ${
                        viewLocked
                          ? "opacity-75 cursor-not-allowed bg-slate-50/50"
                          : "hover:border-burgundy/30 hover:bg-burgundy/[0.02] cursor-pointer"
                      }`}
                      title={
                        viewLocked
                          ? "View is required while edit, delete, or create is selected"
                          : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.key)}
                        disabled={viewLocked}
                        onChange={() =>
                          onSelectionChange(
                            togglePermissionSelection(
                              selectedPermissions,
                              permission.key,
                            ),
                          )
                        }
                        className="h-4 w-4 accent-burgundy shrink-0 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-slate-700 leading-snug">
                        {permission.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionGroupsPicker;
