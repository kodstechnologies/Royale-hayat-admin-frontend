import { useCallback, useEffect, useState } from "react";
import { getDepartments, mapApiDepartmentToListItem } from "@/api/department";
import { getDoctors, type ApiDoctor } from "@/api/doctors";
import type { AppointmentFilterOption } from "./appointmentUtils";

export type { AppointmentFilterOption };

async function fetchAllRecords<T>(
  fetchPage: (page: number, limit: number) => Promise<{
    rows: T[];
    total: number;
  }>,
): Promise<T[]> {
  const limit = 100;
  const first = await fetchPage(1, limit);
  if (first.total <= first.rows.length) return first.rows;

  const full = await fetchPage(1, first.total);
  return full.rows;
}

function uniqueOptionsByValue(
  options: AppointmentFilterOption[],
): AppointmentFilterOption[] {
  const seen = new Set<string>();
  const unique: AppointmentFilterOption[] = [];

  for (const option of options) {
    if (!option.value || seen.has(option.value)) continue;
    seen.add(option.value);
    unique.push(option);
  }

  return unique.sort((a, b) => a.label.localeCompare(b.label));
}

export function useAppointmentFilterOptions() {
  const [departmentOptions, setDepartmentOptions] = useState<
    AppointmentFilterOption[]
  >([]);
  const [doctorOptions, setDoctorOptions] = useState<AppointmentFilterOption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRows, doctorRows] = await Promise.all([
        fetchAllRecords(async (page, limit) => {
          const response = await getDepartments({
            page,
            limit,
            sortBy: "order",
            sortOrder: "asc",
          });
          const rows = Array.isArray(response.data?.data) ? response.data.data : [];
          const total = Number(
            response.data?.meta?.total ??
              response.data?.meta?.totalRecords ??
              rows.length,
          );
          return { rows, total };
        }),
        fetchAllRecords(async (page, limit) => {
          const response = await getDoctors({
            page,
            limit,
            sortBy: "name",
            sortOrder: "asc",
          });
          const rows = Array.isArray(response.data?.data)
            ? (response.data.data as ApiDoctor[])
            : [];
          const total = Number(
            response.data?.meta?.total ??
              response.data?.meta?.totalRecords ??
              rows.length,
          );
          return { rows, total };
        }),
      ]);

      const departments = uniqueOptionsByValue(
        deptRows.map((row) => {
          const mapped = mapApiDepartmentToListItem(row);
          const name = mapped.name.trim();
          const nameAr = mapped.nameAr.trim();
          return {
            value: name,
            label: name,
            nameAr: nameAr && nameAr !== name ? nameAr : undefined,
          };
        }),
      );

      const doctors = uniqueOptionsByValue(
        doctorRows.map((row) => {
          const name = String(row.name ?? "").trim();
          const nameAr = String(row.nameAr ?? "").trim();
          return {
            value: name,
            label: name,
            nameAr: nameAr && nameAr !== name ? nameAr : undefined,
          };
        }),
      );

      setDepartmentOptions(departments);
      setDoctorOptions(doctors);
    } catch {
      setDepartmentOptions([]);
      setDoctorOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  return { departmentOptions, doctorOptions, loading };
}
