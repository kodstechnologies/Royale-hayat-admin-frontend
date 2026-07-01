import { ErrorMessage } from "formik";
import {
  groupSubspecialitiesByDepartment,
  toggleSelectionId,
  type DeptSubspecialityOption,
} from "@/lib/doctorForm";

type DepartmentOption = {
  _id: string;
  name: string;
  arabicName?: string;
};

type DoctorDepartmentFieldsProps = {
  departments: DepartmentOption[];
  departmentIds: string[];
  subspecialityIds: string[];
  deptSubspecialities: DeptSubspecialityOption[];
  deptSubsLoading: boolean;
  activeTab: "english" | "arabic";
  onDepartmentIdsChange: (ids: string[]) => void;
  onSubspecialityIdsChange: (ids: string[]) => void;
  onDepartmentsChange: (nextDepartmentIds: string[]) => void | Promise<void>;
  mode?: "all" | "departments" | "subspecialities";
};

const DoctorDepartmentFields = ({
  departments,
  departmentIds,
  subspecialityIds,
  deptSubspecialities,
  deptSubsLoading,
  activeTab,
  onDepartmentIdsChange,
  onSubspecialityIdsChange,
  onDepartmentsChange,
  mode = "all",
}: DoctorDepartmentFieldsProps) => {
  const getDepartmentDisplayName = (dept: DepartmentOption) =>
    activeTab === "arabic" ? dept.arabicName || dept.name : dept.name;

  const getGroupDisplayName = (group: ReturnType<typeof groupSubspecialitiesByDepartment>[number]) =>
    activeTab === "arabic"
      ? group.departmentNameAr || group.departmentName
      : group.departmentName;

  const getSubspecialityDisplayName = (sub: DeptSubspecialityOption) =>
    activeTab === "arabic" ? sub.arabicName || sub.name : sub.name;

  const handleDepartmentToggle = (deptId: string) => {
    const nextDepartmentIds = toggleSelectionId(deptId, departmentIds);
    onDepartmentIdsChange(nextDepartmentIds);
    void onDepartmentsChange(nextDepartmentIds);
  };

  const groupedSubspecialities = groupSubspecialitiesByDepartment(
    departmentIds,
    departments,
    deptSubspecialities,
  );

  const selectedCountForGroup = (subs: DeptSubspecialityOption[]) =>
    subs.filter((sub) =>
      subspecialityIds.some((selectedId) => String(selectedId) === String(sub._id)),
    ).length;

  const showDepartments = mode === "all" || mode === "departments";
  const showSubspecialities = mode === "all" || mode === "subspecialities";

  return (
    <>
      {showDepartments && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Departments <span className="text-red-500">*</span>{" "}
            <span className="text-slate-400 font-normal">(multi-select)</span>
          </label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/30 p-3 space-y-2">
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-2">No departments available.</p>
            ) : (
              departments.map((dept) => (
                <label
                  key={dept._id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-burgundy focus:ring-burgundy"
                    checked={departmentIds.some((id) => String(id) === String(dept._id))}
                    onChange={() => handleDepartmentToggle(dept._id)}
                  />
                  <span className="text-sm text-slate-700">{getDepartmentDisplayName(dept)}</span>
                </label>
              ))
            )}
          </div>
          {departmentIds.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">{departmentIds.length} department(s) selected</p>
          )}
          <ErrorMessage name="departmentIds" component="p" className="text-xs text-red-500" />
        </div>
      )}

      {showSubspecialities && departmentIds.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            Subspecialities{" "}
            <span className="text-slate-400 font-normal">(optional, multi-select)</span>
          </label>

          {deptSubsLoading ? (
            <p className="text-sm text-slate-500 px-2 py-2">Loading subspecialities…</p>
          ) : groupedSubspecialities.length === 0 ? (
            <p className="text-sm text-amber-600 px-2 py-2">
              Selected departments have no linked subspecialities. Add them on the department edit
              screen.
            </p>
          ) : (
            <div className="space-y-3">
              {groupedSubspecialities.map((group) => (
                <div
                  key={group.departmentId}
                  className="rounded-xl border border-slate-200 bg-slate-50/30 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {getGroupDisplayName(group)}
                    </h4>
                    {group.subspecialities.length > 0 && (
                      <span className="text-xs text-slate-500 shrink-0">
                        {selectedCountForGroup(group.subspecialities)} / {group.subspecialities.length}{" "}
                        selected
                      </span>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto p-3 space-y-1">
                    {group.subspecialities.length === 0 ? (
                      <p className="text-sm text-amber-600 px-2 py-1">
                        No subspecialities linked to this department.
                      </p>
                    ) : (
                      group.subspecialities.map((sub) => (
                        <label
                          key={sub._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-burgundy focus:ring-burgundy"
                            checked={subspecialityIds.some(
                              (selectedId) => String(selectedId) === String(sub._id),
                            )}
                            onChange={() =>
                              onSubspecialityIdsChange(
                                toggleSelectionId(sub._id, subspecialityIds),
                              )
                            }
                          />
                          <span className="text-sm text-slate-700">
                            {getSubspecialityDisplayName(sub)}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {subspecialityIds.length > 0 && (
            <p className="text-xs text-slate-500">{subspecialityIds.length} total selected</p>
          )}
        </div>
      )}
    </>
  );
};

export default DoctorDepartmentFields;
