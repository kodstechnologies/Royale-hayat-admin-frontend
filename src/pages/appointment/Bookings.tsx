import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import AppointmentBookingsTab from "@/components/appointment/AppointmentBookingsTab";
import AppointmentSectionNav from "@/components/appointment/AppointmentSectionNav";

const Bookings = () => {
  useLanguage();

  return (
    <AdminLayout title="Patient Bookings">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Patient Bookings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View and filter all patient appointment bookings
            </p>
          </div>

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
