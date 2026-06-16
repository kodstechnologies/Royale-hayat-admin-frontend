import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import AppointmentBookingsTab from "@/components/appointment/AppointmentBookingsTab";
import AppointmentSectionNav from "@/components/appointment/AppointmentSectionNav";
import { getAppointmentCounts } from "@/api/appointmentRequest";

const Bookings = () => {
  const [unviewedCount, setUnviewedCount] = useState(0);

  const fetchUnviewedCount = useCallback(async () => {
    try {
      const res = await getAppointmentCounts();
      if (res?.success && res.data) {
        setUnviewedCount(res.data.appointmentBookings ?? 0);
      }
    } catch {
      setUnviewedCount(0);
    }
  }, []);

  useEffect(() => {
    void fetchUnviewedCount();

    const handleAppointmentsUpdated = () => {
      void fetchUnviewedCount();
    };

    window.addEventListener("appointmentsUpdated", handleAppointmentsUpdated);
    return () => {
      window.removeEventListener(
        "appointmentsUpdated",
        handleAppointmentsUpdated,
      );
    };
  }, [fetchUnviewedCount]);

  return (
    <AdminLayout title="Patient Bookings">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Patient Bookings
            </h2>
            {unviewedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {unviewedCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            View and filter all patient appointment bookings
          </p>
          <AppointmentSectionNav />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <h3 className="text-lg font-semibold text-slate-800">
              All Bookings
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Filter by date range, department, or doctor
            </p>
          </div>

          <div className="p-6">
            <AppointmentBookingsTab />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Bookings;
