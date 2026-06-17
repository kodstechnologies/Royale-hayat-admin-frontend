import { useState, useEffect, useCallback, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Eye, CheckCircle, Clock } from "lucide-react";
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
} from "./appointmentUtils";

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

  const departments = [
    ...new Set(bookings.map((b) => b.department).filter(Boolean)),
  ] as string[];
  const doctors = [
    ...new Set(bookings.map((b) => b.doctorName).filter(Boolean)),
  ] as string[];

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters(defaultBookingFilters);
  };

  const updateFilters = useCallback(
    (value: SetStateAction<BookingListFiltersState>) => {
      setCurrentPage(1);
      setFilters(value);
    },
    [],
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentBookings(
        currentPage,
        APPOINTMENT_PAGE_SIZE,
        {
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          department: filters.department || undefined,
          doctor: filters.doctor || undefined,
        },
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
  }, [filters, currentPage, onCountChange]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings, refreshKey]);

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {["Name", "Appointment Date", "Department", "Doctor", "Status", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100 animate-pulse">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="py-3 px-4">
                    <div className="h-4 bg-slate-100 rounded w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppointmentFilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={updateFilters}
        departments={departments}
        doctors={doctors}
        showStatusFilter={false}
        hasData={listMeta.total > 0}
        clearFilters={clearFilters}
      />

      {bookings.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">
            No bookings found matching filters
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Appointment Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Department
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Doctor
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => {
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
              })}
            </tbody>
          </table>

          <AppointmentPagination
            currentPage={currentPage}
            totalPages={listMeta.pages}
            totalRecords={listMeta.total}
            onPageChange={setCurrentPage}
            itemLabel="bookings"
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentBookingsTab;
