import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  User,
  Calendar,
  Users,
  Stethoscope,
  Building,
  UserCircle,
  Clock,
  CheckCircle,
  IdCard,
  Globe,
  ClipboardList,
} from "lucide-react";
import { getAppointmentBookingRecordById } from "@/api/appointmentRequest";
import {
  type BookingItem,
  mapBookingFromApi,
  formatDisplayDate,
  getAgeFromDob,
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

const ViewBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useScrollToTop(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAppointmentBookingRecordById(id)
      .then((res) => {
        if (res?.data) {
          setBooking(mapBookingFromApi(res.data as Record<string, unknown>));
          notifyAppointmentsUpdated();
        } else {
          setBooking(null);
        }
      })
      .catch(() => {
        setBooking(null);
        toast.error("Failed to load booking details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="View Booking">
        <div className="space-y-6">
          <BreadCrumb />
          <ViewLoadingState />
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout title="View Booking">
        <div className="space-y-6">
          <BreadCrumb />
          <ViewNotFoundState
            message="Booking not found"
            backLabel="Back to Bookings"
            onBack={() => navigate("/appointment/bookings")}
          />
        </div>
      </AdminLayout>
    );
  }

  const isViewed = booking.isViewed === true;

  return (
    <AdminLayout title="View Booking">
      <div className="space-y-6">
        <BreadCrumb lastCrumbLabel={booking.fullName} />

        <ViewPageShell
          backLabel="Back to Bookings"
          onBack={() => navigate("/appointment/bookings")}
          title={booking.fullName}
          subtitle="Patient appointment booking"
          badge={
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isViewed
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isViewed ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {isViewed ? "Viewed" : "New"}
            </span>
          }
        >
          

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DetailSection
              title="Patient & Identity"
              description="Personal and identification details"
              icon={User}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Full Name"
                  value={booking.fullName}
                  icon={User}
                />
                <InfoRow
                  label="Civil ID"
                  value={booking.civilId}
                  icon={IdCard}
                  mono
                />
                <InfoRow
                  label="Passport Number"
                  value={booking.passportNumber}
                  icon={IdCard}
                  mono
                />
                <InfoRow
                  label="Date of Birth"
                  value={
                    booking.dateOfBirth
                      ? `${formatDisplayDate(booking.dateOfBirth)} (${getAgeFromDob(booking.dateOfBirth)} years)`
                      : undefined
                  }
                  icon={Calendar}
                />
                <InfoRow
                  label="Nationality"
                  value={booking.nationality}
                  icon={Globe}
                />
                <InfoRow label="Gender" value={booking.gender} icon={Users} />
              </div>
            </DetailSection>

            <DetailSection
              title="Appointment Details"
              description="Scheduled visit information"
              icon={ClipboardList}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="Appointment Date"
                  value={
                    booking.appointmentDate
                      ? formatDisplayDate(booking.appointmentDate)
                      : undefined
                  }
                  icon={Calendar}
                />
                <InfoRow
                  label="Time Slot"
                  value={booking.timeSlot}
                  icon={Clock}
                />
                <InfoRow
                  label="Department"
                  value={booking.department}
                  icon={Building}
                />
                <InfoRow
                  label="Doctor Name"
                  value={booking.doctorName}
                  icon={UserCircle}
                />
              </div>
            </DetailSection>
          </div>

          {booking.symptoms && (
            <div className="mt-5">
              <DetailSection
                title="Clinical Information"
                description=""
                icon={Stethoscope}
              >
                <NotesBlock label="Symptoms" value={booking.symptoms} />
              </DetailSection>
            </div>
          )}
        </ViewPageShell>
      </div>
    </AdminLayout>
  );
};

export default ViewBookings;
