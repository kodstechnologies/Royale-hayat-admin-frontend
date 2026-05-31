import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  User,
  Phone,
  Calendar,
  Users,
  Stethoscope,
  Building,
  UserCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { getAppointmentRequestById } from "@/api/appointmentRequest";
import {
  type AppointmentRequestItem,
  mapRequestFromApi,
  formatDisplayDate,
  getAgeFromDob,
  getRequestTypeLabel,
} from "@/components/appointment/appointmentUtils";
import {
  DetailSection,
  InfoRow,
  NotesBlock,
  SummaryChip,
  ViewLoadingState,
  ViewNotFoundState,
  ViewPageShell,
} from "@/components/appointment/AppointmentDetailLayout";
import { toast } from "sonner";
import { notifyAppointmentsUpdated } from "@/lib/appointmentCounts";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const statusConfig: Record<
  AppointmentRequestItem["status"],
  { icon: typeof Clock; color: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
    label: "Pending",
  },
  confirmed: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
    label: "Confirmed",
  },
  cancelled: {
    icon: XCircle,
    color: "bg-red-100 text-red-700",
    label: "Cancelled",
  },
};

const ViewAppointmentRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AppointmentRequestItem | null>(null);
  const [loading, setLoading] = useState(true);

  useScrollToTop(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAppointmentRequestById(id)
      .then((res) => {
        if (res?.data) {
          setRequest(
            mapRequestFromApi(res.data as Record<string, unknown>),
          );
          notifyAppointmentsUpdated();
        } else {
          setRequest(null);
        }
      })
      .catch(() => {
        setRequest(null);
        toast.error("Failed to load appointment request details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="View Appointment Request">
        <div className="space-y-6">
          <BreadCrumb />
          <ViewLoadingState />
        </div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout title="View Appointment Request">
        <div className="space-y-6">
          <BreadCrumb />
          <ViewNotFoundState
            message="Request not found"
            backLabel="Back to Requests"
            onBack={() => navigate("/appointment")}
          />
        </div>
      </AdminLayout>
    );
  }

  const status = statusConfig[request.status];
  const StatusIcon = status.icon;
  const timeSlotLabel = request.timeSlot
    ? `${request.timeSlot.period ? `${request.timeSlot.period} — ` : ""}${request.timeSlot.time}`
    : undefined;

  return (
    <AdminLayout title="View Appointment Request">
      <div className="space-y-6">
        <BreadCrumb lastCrumbLabel={request.fullName} />

        <ViewPageShell
          backLabel="Back to Requests"
          onBack={() => navigate("/appointment")}
          title={request.fullName}
          subtitle={getRequestTypeLabel(request.requestType)}
          badge={
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          }
        >
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <SummaryChip
              label="Preferred Date"
              value={
                request.preferredDate
                  ? formatDisplayDate(request.preferredDate)
                  : undefined
              }
              icon={Calendar}
            />
            <SummaryChip label="Time Slot" value={timeSlotLabel} icon={Clock} />
            <SummaryChip
              label="Department"
              value={request.department}
              icon={Building}
            />
            <SummaryChip
              label="Doctor"
              value={request.doctorName}
              icon={UserCircle}
            />
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DetailSection
              title="Patient Information"
              description="Contact and demographic details"
              icon={User}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Full Name" value={request.fullName} icon={User} />
                <InfoRow
                  label="Phone Number"
                  value={request.phone}
                  icon={Phone}
                />
                <InfoRow
                  label="Date of Birth"
                  value={
                    request.dateOfBirth
                      ? `${formatDisplayDate(request.dateOfBirth)} (${getAgeFromDob(request.dateOfBirth)} years)`
                      : undefined
                  }
                  icon={Calendar}
                />
                <InfoRow label="Gender" value={request.gender} icon={Users} />
              </div>
            </DetailSection>

            <DetailSection
              title="Appointment Details"
              description="Scheduling and care team"
              icon={ClipboardList}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Preferred Date"
                  value={
                    request.preferredDate
                      ? formatDisplayDate(request.preferredDate)
                      : undefined
                  }
                  icon={Calendar}
                />
                <InfoRow
                  label="Time Slot"
                  value={timeSlotLabel}
                  icon={Clock}
                />
                <InfoRow
                  label="Department"
                  value={request.department}
                  icon={Building}
                />
                <InfoRow
                  label="Doctor Name"
                  value={request.doctorName}
                  icon={UserCircle}
                />
              </div>
            </DetailSection>
          </div>

          {(request.symptoms ||
            request.additionalNotes ||
            request.comments) && (
            <div className="mt-5">
              <DetailSection
                title="Notes"
                description=""
                icon={Stethoscope}
              >
                <div className="space-y-3">
                  <NotesBlock label="Symptoms" value={request.symptoms} />
                  <NotesBlock
                    label="Additional Notes"
                    value={request.additionalNotes}
                  />
                  <NotesBlock label="Staff Note" value={request.comments} />
                </div>
              </DetailSection>
            </div>
          )}
        </ViewPageShell>
      </div>
    </AdminLayout>
  );
};

export default ViewAppointmentRequest;
