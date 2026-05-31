import { useState, useEffect, useCallback, useRef, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAppointmentRequests,
  acceptRequest,
  cancelRequest,
  type AppointmentRequestType,
} from "@/api/appointmentRequest";
import {
  type AppointmentRequestItem,
  type AppointmentListFiltersState,
  defaultRequestFilters,
  mapRequestFromApi,
  mapUiStatusToApi,
  formatTableDate,
} from "./appointmentUtils";
import AppointmentFilterSection from "./AppointmentFilterSection";
import StatusUpdateModal from "./StatusUpdateModal";
import AppointmentPagination, {
  APPOINTMENT_PAGE_SIZE,
  defaultListMeta,
  parseListMeta,
  type AppointmentListMeta,
} from "./AppointmentPagination";

export type AppointmentRequestStats = {
  pending: number;
  confirmed: number;
  cancelled: number;
};

type AppointmentRequestsTabProps = {
  requestType: AppointmentRequestType;
  emptyMessage: string;
  canManageRequests: boolean;
  onCountChange?: (count: number) => void;
  onStatsChange?: (stats: AppointmentRequestStats) => void;
  onMutation?: () => void;
  refreshKey?: number;
};

const statusStyles: Record<
  AppointmentRequestItem["status"],
  { color: string; bg: string; icon: LucideIcon; label: string }
> = {
  pending: {
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: Clock,
    label: "Pending",
  },
  confirmed: {
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle,
    label: "Confirmed",
  },
  cancelled: {
    color: "text-red-700",
    bg: "bg-red-100",
    icon: XCircle,
    label: "Cancelled",
  },
};

const AppointmentRequestsTab = ({
  requestType,
  emptyMessage,
  canManageRequests,
  onCountChange,
  onStatsChange,
  onMutation,
  refreshKey = 0,
}: AppointmentRequestsTabProps) => {
  const navigate = useNavigate();
  const onCountChangeRef = useRef(onCountChange);
  const onStatsChangeRef = useRef(onStatsChange);
  const requestTypeRef = useRef(requestType);

  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    onStatsChangeRef.current = onStatsChange;
  }, [onStatsChange]);

  useEffect(() => {
    requestTypeRef.current = requestType;
  }, [requestType]);

  const [requests, setRequests] = useState<AppointmentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [listMeta, setListMeta] = useState<AppointmentListMeta>(defaultListMeta);
  const [filters, setFilters] =
    useState<AppointmentListFiltersState>(defaultRequestFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    id: string;
    newStatus: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    newStatus: "",
    name: "",
  });

  const departments = [
    ...new Set(requests.map((r) => r.department).filter(Boolean)),
  ] as string[];
  const doctors = [
    ...new Set(requests.map((r) => r.doctorName).filter(Boolean)),
  ] as string[];
  const statuses: AppointmentRequestItem["status"][] = [
    "pending",
    "confirmed",
    "cancelled",
  ];

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({ ...defaultRequestFilters });
  };

  const updateFilters = useCallback(
    (value: SetStateAction<AppointmentListFiltersState>) => {
      setCurrentPage(1);
      setFilters(value);
    },
    [],
  );

  useEffect(() => {
    setFilters({ ...defaultRequestFilters });
    setShowFilters(false);
    setCurrentPage(1);
  }, [requestType]);

  const fetchRequests = useCallback(async () => {
    const typeForFetch = requestType;
    const pageForFetch = currentPage;
    setLoading(true);
    try {
      const res = await getAppointmentRequests(
        pageForFetch,
        APPOINTMENT_PAGE_SIZE,
        {
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        department: filters.department || undefined,
        doctor: filters.doctor || undefined,
        status: mapUiStatusToApi(filters.status),
        requestType,
      },
      );
      const list = res?.data ?? [];
      const mapped = Array.isArray(list)
        ? list.map((row) =>
            mapRequestFromApi(row as Record<string, unknown>),
          )
        : [];

      if (requestTypeRef.current !== typeForFetch) return;

      setRequests(mapped);
      setListMeta(parseListMeta(res?.meta, mapped.length));

      const stats: AppointmentRequestStats = {
        pending: mapped.filter((r) => r.status === "pending").length,
        confirmed: mapped.filter((r) => r.status === "confirmed").length,
        cancelled: mapped.filter((r) => r.status === "cancelled").length,
      };
      const unviewed =
        typeof res?.meta?.unviewed === "number"
          ? res.meta.unviewed
          : mapped.filter((r) => !r.isViewed).length;
      onCountChangeRef.current?.(unviewed);
      onStatsChangeRef.current?.(stats);
    } catch {
      if (requestTypeRef.current !== typeForFetch) return;
      toast.error("Failed to load appointment requests");
      setRequests([]);
      setListMeta(defaultListMeta);
      onCountChangeRef.current?.(0);
      onStatsChangeRef.current?.({
        pending: 0,
        confirmed: 0,
        cancelled: 0,
      });
    } finally {
      if (requestTypeRef.current === typeForFetch) {
        setLoading(false);
      }
    }
  }, [filters, requestType, currentPage]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests, refreshKey]);

  useEffect(() => {
    const handleAppointmentsUpdated = () => {
      void fetchRequests();
    };
    window.addEventListener("appointmentsUpdated", handleAppointmentsUpdated);
    return () => {
      window.removeEventListener(
        "appointmentsUpdated",
        handleAppointmentsUpdated,
      );
    };
  }, [fetchRequests]);

  const handleStatusChange = async (
    id: string,
    newStatus: string,
    comment: string,
  ) => {
    if (newStatus === "confirmed") {
      await acceptRequest(id, comment);
    } else if (newStatus === "cancelled") {
      await cancelRequest(id, comment);
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus as AppointmentRequestItem["status"],
              comments: comment || r.comments,
            }
          : r,
      ),
    );

    await fetchRequests();
    onMutation?.();
  };

  const handleStatusUpdate = async (comment: string) => {
    setActionLoading(statusModal.id);
    try {
      await handleStatusChange(statusModal.id, statusModal.newStatus, comment);
      toast.success(`Request ${statusModal.newStatus} successfully`);
      setStatusModal({ isOpen: false, id: "", newStatus: "", name: "" });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {["Name", "Date", "Department", "Doctor", "Status", "Actions"].map(
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
    <>
      <AppointmentFilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={updateFilters}
        departments={departments}
        doctors={doctors}
        statuses={statuses}
        showStatusFilter={true}
        hasData={listMeta.total > 0}
        clearFilters={clearFilters}
      />

      {requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">{emptyMessage}</p>
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
                  Date
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
              {requests.map((req, index) => {
                const StatusIcon = statusStyles[req.status].icon;
                const isActioning = actionLoading === req.id;

                return (
                  <tr
                    key={req.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {req.fullName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {req.phone && (
                          <span className="text-xs text-slate-400">
                            {req.phone}
                          </span>
                        )}
                        {!req.isViewed && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatTableDate(req.preferredDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {req.department || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {req.doctorName || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[req.status].bg} ${statusStyles[req.status].color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusStyles[req.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/appointment/view/${req.id}`)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {canManageRequests && req.status !== "confirmed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isActioning}
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                id: req.id,
                                newStatus: "confirmed",
                                name: req.fullName,
                              })
                            }
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Confirm Request"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageRequests && req.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isActioning}
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                id: req.id,
                                newStatus: "cancelled",
                                name: req.fullName,
                              })
                            }
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Cancel Request"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
            itemLabel="requests"
          />
        </div>
      )}

      {canManageRequests && (
        <StatusUpdateModal
          isOpen={statusModal.isOpen}
          onClose={() =>
            setStatusModal({ isOpen: false, id: "", newStatus: "", name: "" })
          }
          onConfirm={handleStatusUpdate}
          currentStatus={statusModal.newStatus}
          itemName={statusModal.name}
        />
      )}
    </>
  );
};

export default AppointmentRequestsTab;
