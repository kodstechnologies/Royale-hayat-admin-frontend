import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { ArrowLeft, CalendarHeart, Trash2 } from "lucide-react";
import { deleteEvent, getEventById, type EventBooking } from "@/api/event";
import AlertBox from "@/components/AlertBox";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/utils/PermissionGate";
import { useLanguage } from "@/contexts/LanguageContext";

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

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ViewEventBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = hasPermission(PERMISSIONS.EVENT_DELETE);

  useScrollToTop(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEventById(id)
      .then((res) => {
        const data = res?.data?.data;
        if (data) {
          setEvent(data);
          window.dispatchEvent(new Event("eventBookingsUpdated"));
        }
      })
      .catch(() => {
        toast.error("Failed to load event booking");
        navigate("/event-bookings");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const confirmDelete = async () => {
    if (!id || !canDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(id);
      toast.success("Event booking deleted successfully");
      window.dispatchEvent(new Event("eventBookingsUpdated"));
      navigate("/event-bookings");
    } catch {
      toast.error("Failed to delete event booking");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="View Event Booking">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/event-bookings")}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-burgundy"
          >
            <ArrowLeft size={16} />
            {t("Back to Event Bookings")}
          </button>
          {canDelete && event && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              {t("Delete")}
            </button>
          )}
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
          <div className="p-6">
            {loading ? (
              <div className="py-16 text-center text-slate-500">{t("Loading...")}</div>
            ) : !event ? (
              <div className="py-16 text-center text-slate-500">{t("Event booking not found")}</div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center">
                    <CalendarHeart className="h-5 w-5 text-burgundy" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{event.name}</h2>
                    <p className="text-sm text-slate-500">{formatHall(event.hall)}</p>
                  </div>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      event.isViewed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {event.isViewed ? t("Viewed") : t("New")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Detail label={t("Email")} value={event.email} />
                  <Detail label={t("Mobile")} value={event.mobileNumber} />
                  <Detail label={t("Hall")} value={formatHall(event.hall)} />
                  <Detail
                    label={t("Event Type")}
                    value={formatEventType(event.eventType, event.otherEventType)}
                  />
                  <Detail
                    label={t("Due Date of Expecting Mother")}
                    value={formatDate(event.dueDateOfExpectingMother)}
                  />
                  <Detail label={t("Proposed Date")} value={formatDate(event.proposedDate)} />
                  <Detail label={t("Number of Days")} value={String(event.days ?? "—")} />
                  <Detail label={t("MRN")} value={event.mrn?.trim() || "—"} />
                  <Detail label={t("Submitted")} value={formatDate(event.createdAt)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => {
          if (!isDeleting) setDeleteOpen(false);
        }}
        onConfirm={() => void confirmDelete()}
        title={t("Delete Event Booking")}
        message={`${t("Are you sure you want to delete the booking for")} "${event?.name}"? ${t("This action cannot be undone.")}`}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-100 bg-white/80 p-3">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="font-medium text-slate-800 break-words">{value}</p>
  </div>
);

export default ViewEventBooking;
