import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getAppointmentBookings } from "@/api/appointmentRequest";
import AppointmentFilterSection from "./AppointmentFilterSection";
import AppointmentPagination, {
  APPOINTMENT_PAGE_SIZE,
  defaultListMeta,
  parseListMeta,
  type AppointmentListMeta,
} from "./AppointmentPagination";
import {
  type BookingItem,
  type BookingListFiltersState,
  defaultBookingFilters,
  mapBookingFromApi,
  formatTableDate,
  formatTableDateTime,
  buildAppointmentApiFilters,
} from "./appointmentUtils";
import { useAppointmentFilterOptions } from "./useAppointmentFilterOptions";
import { useDebouncedPatientSearch } from "./useDebouncedPatientSearch";

type AppointmentBookingsTabProps = {
  refreshKey?: number;
  onCountChange?: (count: number) => void;
};

const bookingStatusStyles = {
  new: {
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: Clock,
    label: "New",
  },
  viewed: {
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle,
    label: "Viewed",
  },
};

const AppointmentBookingsTab = ({
  refreshKey,
  onCountChange,
}: AppointmentBookingsTabProps) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [listMeta, setListMeta] = useState<AppointmentListMeta>(defaultListMeta);
  const [filters, setFilters] =
    useState<BookingListFiltersState>(defaultBookingFilters);
  const [showFilters, setShowFilters] = useState(false);
  const { departmentOptions, doctorOptions, loading: optionsLoading } =
    useAppointmentFilterOptions();
  const debouncedPatientName = useDebouncedPatientSearch(filters.patientName);

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters(defaultBookingFilters);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.fromDate,
    filters.toDate,
    filters.department,
    filters.doctor,
    debouncedPatientName,
  ]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentBookings(
        currentPage,
        APPOINTMENT_PAGE_SIZE,
        buildAppointmentApiFilters(filters, {
          departmentOptions,
          doctorOptions,
        }, {
          patientName: debouncedPatientName || undefined,
        }),
      );
      const list = res?.data ?? [];
      const mapped = Array.isArray(list)
        ? list.map((row) =>
            mapBookingFromApi(row as Record<string, unknown>),
          )
        : [];
      setBookings(mapped);
      setListMeta(parseListMeta(res?.meta, mapped.length));
      onCountChange?.(
        typeof res?.meta?.total === "number" ? res.meta.total : mapped.length,
      );
    } catch {
      toast.error("Failed to load appointment bookings");
      setBookings([]);
      setListMeta(defaultListMeta);
      onCountChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [
    filters.fromDate,
    filters.toDate,
    filters.department,
    filters.doctor,
    debouncedPatientName,
    currentPage,
    onCountChange,
    departmentOptions,
    doctorOptions,
  ]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings, refreshKey]);

  const tableColumns = [
    "Name",
    "Appointment Date",
    "Created At",
    "Department",
    "Doctor",
    "Status",
    "Actions",
  ];

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="py-3 px-4">
              <div className="h-4 bg-slate-100 rounded w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ));
    }

    if (bookings.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="py-16 text-center text-slate-500 font-medium">
            No bookings found matching filters
          </td>
        </tr>
      );
    }

    return bookings.map((booking, index) => {
                const statusKey = booking.isViewed ? "viewed" : "new";
                const status = bookingStatusStyles[statusKey];
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={booking.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {booking.fullName}
                      </div>
                      {booking.civilId && (
                        <div className="text-xs text-slate-400">
                          Civil ID: {booking.civilId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatTableDate(booking.appointmentDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatTableDateTime(booking.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {booking.department || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {booking.doctorName || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/appointment/bookings/view/${booking.id}`)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              });
  };

  return (
    <div className="space-y-4">
      <AppointmentFilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        departments={departmentOptions}
        doctors={doctorOptions}
        optionsLoading={optionsLoading}
        showStatusFilter={false}
        clearFilters={clearFilters}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {tableColumns.map((col) => (
                <th
                  key={col}
                  className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>

        {!loading && bookings.length > 0 && (
          <AppointmentPagination
            currentPage={currentPage}
            totalPages={listMeta.pages}
            totalRecords={listMeta.total}
            onPageChange={setCurrentPage}
            itemLabel="bookings"
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentBookingsTab;
