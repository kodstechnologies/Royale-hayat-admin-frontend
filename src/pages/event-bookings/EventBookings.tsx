import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Search, Eye, Trash2, CalendarHeart } from "lucide-react";
import { deleteEvent, getAllEvents, type EventBooking } from "@/api/event";
import AlertBox from "@/components/AlertBox";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/utils/PermissionGate";

type EventRow = EventBooking & {
  id: string;
  date: string;
};

const formatHall = (hall: string) => {
  const map: Record<string, string> = {
    gardenia: "Gardenia Banquet Hall",
    aljouri: "Al Jouri Banquet Hall",
    "in-room-event": "In Room Event Services",
    "in-room-event-services": "In Room Event Services",
  };
  return map[hall] ?? hall;
};

const formatEventType = (eventType: string, otherEventType?: string) => {
  const map: Record<string, string> = {
    birth: "Birth celebrations",
    workshop: "Workshop",
    social: "Social event",
    other: otherEventType?.trim() || "Other",
  };
  return map[eventType] ?? eventType;
};

const EventBookings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "viewed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = hasPermission(PERMISSIONS.EVENT_DELETE);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (filter === "new") params.isViewed = false;
      if (filter === "viewed") params.isViewed = true;

      const response = await getAllEvents(params);
      const list = response?.data?.data || [];
      const mapped: EventRow[] = (Array.isArray(list) ? list : []).map(
        (item: EventBooking) => ({
          ...item,
          id: String(item._id),
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
        }),
      );
      setEvents(mapped);
      setTotalPages(response?.data?.meta?.totalPages || 1);
      setUnviewedCount(response?.data?.meta?.unviewedCount ?? 0);
    } catch {
      setEvents([]);
      setTotalPages(1);
      toast.error("Failed to load event bookings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filter]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.mobileNumber.toLowerCase().includes(q) ||
      formatHall(row.hall).toLowerCase().includes(q)
    );
  });

  const viewedBadge = (isViewed?: boolean) =>
    isViewed ? (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
        {t("Viewed")}
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
        {t("New")}
      </span>
    );

  const handleDeleteClick = (row: EventRow) => {
    if (!canDelete) return;
    setEventToDelete(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete || !canDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      toast.success("Event booking deleted successfully");
      setDeleteOpen(false);
      setEventToDelete(null);
      window.dispatchEvent(new Event("eventBookingsUpdated"));
      void fetchEvents();
    } catch {
      toast.error("Failed to delete event booking");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Event Bookings">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  {t("Event Bookings")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t("Manage hospitality event booking requests submitted from the website.")}
                </p>
              </div>
              {unviewedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-burgundy/10 text-burgundy">
                  {unviewedCount} {t("new")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search by name, email, hall...")}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
              {(["all", "new", "viewed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    filter === f
                      ? "bg-burgundy text-white border-burgundy"
                      : "border-slate-200 text-slate-600 hover:border-burgundy"
                  }`}
                >
                  {t(f === "all" ? "All" : f === "new" ? "New" : "Viewed")}
                </button>
              ))}
            </div>

            {loading ? (
              <TableSkeletonLoader columns={7} rows={6} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <CalendarHeart className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">{t("No event bookings found")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                    <tr>
                      <th className="text-left px-4 py-2.5">{t("Name")}</th>
                      <th className="text-left px-4 py-2.5">{t("Hall")}</th>
                      <th className="text-left px-4 py-2.5">{t("Event Type")}</th>
                      <th className="text-left px-4 py-2.5">{t("Proposed Date")}</th>
                      <th className="text-left px-4 py-2.5">{t("Submitted")}</th>
                      <th className="text-left px-4 py-2.5">{t("Status")}</th>
                      <th className="text-right px-4 py-2.5">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-t border-slate-100 hover:bg-slate-50/80 ${
                          !row.isViewed ? "bg-burgundy/[0.02]" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-800">{row.name}</div>
                          <div className="text-[10px] text-slate-500">{row.email}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{formatHall(row.hall)}</td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {formatEventType(row.eventType, row.otherEventType)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {row.proposedDate
                            ? new Date(row.proposedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{row.date}</td>
                        <td className="px-4 py-2.5">{viewedBadge(row.isViewed)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/event-bookings/view/${row.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10"
                              aria-label={t("View")}
                            >
                              <Eye size={16} />
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                aria-label={t("Delete")}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  {t("Previous")}
                </button>
                <span className="px-3 py-1.5 text-xs text-slate-600">
                  {t("Page")} {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  {t("Next")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteOpen(false);
            setEventToDelete(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
        title={t("Delete Event Booking")}
        message={`${t("Are you sure you want to delete the booking for")} "${eventToDelete?.name}"? ${t("This action cannot be undone.")}`}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default EventBookings;
