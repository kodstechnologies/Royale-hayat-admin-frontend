import { Filter, X as XIcon } from "lucide-react";
import { formatDisplayDate } from "./appointmentUtils";

type FilterValues = {
  fromDate: string;
  toDate: string;
  department: string;
  doctor: string;
  status?: string;
};

type AppointmentFilterSectionProps<T extends FilterValues> = {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
  departments: string[];
  doctors: string[];
  statuses?: string[];
  showStatusFilter?: boolean;
  hasData?: boolean;
  clearFilters: () => void;
};

const AppointmentFilterSection = <T extends FilterValues>({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  departments,
  doctors,
  statuses,
  showStatusFilter = false,
  hasData = false,
  clearFilters,
}: AppointmentFilterSectionProps<T>) => {
  const showFacetFilters = hasData;
  const dateRangeError =
    filters.fromDate &&
    filters.toDate &&
    filters.toDate < filters.fromDate
      ? "To date cannot be earlier than from date"
      : "";

  const handleFromDateChange = (value: string) => {
    setFilters((prev) => {
      const next = { ...prev, fromDate: value };
      if (value && prev.toDate && prev.toDate < value) {
        next.toDate = value;
      }
      return next;
    });
  };

  const handleToDateChange = (value: string) => {
    setFilters((prev) => {
      if (value && prev.fromDate && value < prev.fromDate) {
        return { ...prev, toDate: prev.fromDate };
      }
      return { ...prev, toDate: value };
    });
  };

  const filterGridClass = showFacetFilters
    ? showStatusFilter
      ? "mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      : "mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    : "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-burgundy transition-colors"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className={filterGridClass}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              max={filters.toDate || undefined}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              min={filters.fromDate || undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent ${
                dateRangeError ? "border-red-300" : "border-slate-300"
              }`}
            />
            {dateRangeError && (
              <p className="mt-1 text-xs text-red-600">{dateRangeError}</p>
            )}
          </div>
          {showFacetFilters && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showFacetFilters && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Doctor
              </label>
              <select
                value={filters.doctor}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, doctor: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showFacetFilters && showStatusFilter && statuses && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                value={filters.status ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {(filters.fromDate ||
        filters.toDate ||
        (showFacetFilters &&
          (filters.department || filters.doctor || filters.status))) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.fromDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              From: {formatDisplayDate(filters.fromDate)}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, fromDate: "" }))
                }
                className="hover:text-red-500"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.toDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              To: {formatDisplayDate(filters.toDate)}
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, toDate: "" }))}
                className="hover:text-red-500"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.department && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Dept: {filters.department}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, department: "" }))
                }
                className="hover:text-red-500"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.doctor && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Doctor: {filters.doctor}
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, doctor: "" }))}
                className="hover:text-red-500"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Status:{" "}
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: "" }))}
                className="hover:text-red-500"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-burgundy hover:underline"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentFilterSection;
