// ViewEnquiry.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";

import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Building2,
  Clock,
  AtSign,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import AlertBox from "@/components/AlertBox";
import { deleteEnquiry, getEnquiryById } from "@/api/enquiries";
import { toast } from "sonner";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type Enquiry = {
  _id: string;
  enquiryId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  message: string;
  createdAt: string;
};

const ViewEnquiry = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        if (!id) return;

        setLoading(true);

        const response = await getEnquiryById(id);

        setEnquiry(response.data.data);
        setError("");
      } catch (err: any) {
        setEnquiry(null);

        setError(
          err?.response?.data?.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [id]);

  const confirmDelete = async () => {
    if (!enquiry?._id || !hasPermission(PERMISSIONS.ENQUIRY_DELETE)) return;

    setIsDeleting(true);
    try {
      await deleteEnquiry(enquiry._id);
      toast.success("Enquiry deleted successfully");
      setDeleteOpen(false);
      navigate("/enquiries");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error?.response?.data?.message || "Failed to delete enquiry",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout title="View Enquiry">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !enquiry) {
    return (
      <AdminLayout title="View Enquiry">
        <div className="space-y-6">
          <BreadCrumb />

          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Mail className="h-10 w-10 text-red-500" />
            </div>

            <p className="text-red-600 font-medium">
              {error || "Enquiry not found"}
            </p>

            <Button
              onClick={() => navigate("/enquiries")}
              className="mt-4 gap-2"
              variant="outline"
            >
              Back to Enquiries
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Enquiry">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/enquiries")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-burgundy" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Enquiry Details
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      #{enquiry.enquiryId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-burgundy rounded-full"></div>
                    Sender Information
                  </h3>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-burgundy" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Full Name
                        </p>

                        <p className="text-sm font-medium text-slate-800">
                          {enquiry.name}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <AtSign className="h-5 w-5 text-burgundy" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Email Address
                        </p>

                        <p className="text-sm font-medium text-slate-800">
                          {enquiry.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-burgundy" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Phone Number
                        </p>

                        <p className="text-sm font-medium text-slate-800">
                          {enquiry.phone}
                        </p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-burgundy" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Department
                        </p>

                        <p className="text-sm font-medium text-slate-800">
                          {enquiry.department}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-burgundy" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Date Received
                        </p>

                        <p className="text-sm font-medium text-slate-800">
                          {formatDate(enquiry.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {/* <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-burgundy rounded-full"></div>
                    Quick Actions
                  </h3>

                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        (window.location.href = `mailto:${enquiry.email}`)
                      }
                      className="w-full gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Mail className="h-4 w-4" />
                      Reply via Email
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate("/enquiries")}
                      className="w-full gap-2"
                    >
                      Back to List
                    </Button>
                  </div>
                </div> */}
              </div>

              {/* Right Side */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-amber-600" />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800">
                      Message Content
                    </h3>
                  </div>

                  <div className="bg-amber-50/30 rounded-xl p-5 border border-amber-100">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {enquiry.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />

                      <span>
                        Received: {formatDate(enquiry.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />

                      <span>
                        Department: {enquiry.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/enquiries")}
                className="w-full sm:w-auto"
              >
                Back to Enquiries
              </Button>
              <PermissionGate permission={PERMISSIONS.ENQUIRY_DELETE}>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Enquiry
                </Button>
              </PermissionGate>
            </div>
            {/* End Grid */}
          </div>
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${enquiry.name}" (#${enquiry.enquiryId})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default ViewEnquiry;