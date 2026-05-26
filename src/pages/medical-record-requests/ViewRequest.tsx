import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  FileText,
  Building2,
  Mail,
  Phone,
  Calendar,
  IdCard,
  FileCheck,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { GetMedicalRequestById, ShareViaMail } from "@/api/medicalRecordRequest";
import { toast } from "sonner";

type MedicalRequest = {
  id: string;
  mongoId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedDate: string;
  requestId: string;
  // Patient Info
  patientFullName: string;
  civilId: string;
  passportOrGovernmentId?: string;
  patientFileNo: string;
  dateOfBirth: string;
  // Specific Information
  specificAuthorization: string;
  specificDateOfService?: string;
  // Recipient Info
  recipientName: string;
  recipientEmailAddress: string;
  recipientContactNumber: string;
  purposeOfDisclosure: string;
  otherPurpose?: string;
  // Requested By
  requestedBy: string;
  patientNameConfirmation?: string;
};

// Function to generate MRR ID from MongoDB ID
const generateMRRId = (mongoId: string, index?: number): string => {
  if (mongoId && mongoId.startsWith("MRR-")) {
    return mongoId;
  }

  let num = 1;
  if (mongoId) {
    const hash = mongoId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    num = (hash % 1000) + 1;
  } else if (index) {
    num = index + 1;
  }

  return `MRR-${num.toString().padStart(3, '0')}`;
};

// Function to generate sequential MRR ID
const generateSequentialMRRId = (): string => {
  const storedId = localStorage.getItem('lastMRRId');
  let lastNumber = storedId ? parseInt(storedId) : 0;
  const nextNumber = lastNumber + 1;
  localStorage.setItem('lastMRRId', nextNumber.toString());
  return `MRR-${nextNumber.toString().padStart(3, '0')}`;
};

const ViewRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<MedicalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    GetMedicalRequestById(id)
      .then((res) => {
        const d = res?.data ?? res;

        let frontendId = d.requestId;
        if (!frontendId || !frontendId.startsWith("MRR-")) {
          frontendId = generateMRRId(d._id);
          if (!frontendId.startsWith("MRR-")) {
            frontendId = generateSequentialMRRId();
          }
        }

        setRequest({
          id: frontendId,
          mongoId: d._id ?? d.id ?? id,
          status: d.status ?? "pending",
          requestedDate: d.createdAt ?? new Date().toISOString(),
          requestId: frontendId,
          patientFullName: d.patientFullName ?? "—",
          civilId: d.civilId ?? "—",
          passportOrGovernmentId: d.passportOrGovernmentId,
          patientFileNo: d.patientFileNo ?? "—",
          dateOfBirth: d.dateOfBirth ?? "",
          specificAuthorization: d.specificAuthorization ?? "—",
          specificDateOfService: d.specificDateOfService,
          recipientName: d.recipientName ?? "—",
          recipientEmailAddress: d.recipientEmailAddress ?? "—",
          recipientContactNumber: d.recipientContactNumber ?? "—",
          purposeOfDisclosure: d.purposeOfDisclosure ?? "—",
          otherPurpose: d.otherPurpose,
          requestedBy: d.requestedBy ?? "—",
          patientNameConfirmation: d.patientNameConfirmation,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch request:", error);
        setRequest(null);
        toast.error("Failed to load request details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleShareViaEmail = async () => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!id) {
      toast.error("Request ID not found");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSharing(true);
    try {
  
  
      // Call the ShareViaMail API function
      const response = await ShareViaMail(
        id,
        shareEmail
      );

      toast.success(response?.message || `Medical record shared successfully to ${shareEmail}`);
      setIsShareModalOpen(false);
      setShareEmail("");
    } catch (error: any) {
      console.error("Failed to share via email:", error);

      // Handle different error scenarios
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.status === 404) {
        toast.error("Request not found");
      } else if (error?.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to share medical record. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadDocument = (url: string, fileName: string) => {
    if (!url) {
      toast.error("No document available for download");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening document in new tab");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
      completed: { icon: CheckCircle, color: "bg-blue-100 text-blue-700", label: "Completed" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return "document";
    const parts = url.split('/');
    const fileName = parts[parts.length - 1].split('?')[0];
    return fileName || "passport_document";
  };

  if (loading) {
    return (
      <AdminLayout title="View Request">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-slate-500">Loading request details...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout title="View Request">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            <div className="p-6 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Request not found</p>
              <Button
                onClick={() => navigate("/medical-records-requests")}
                className="mt-4 gap-2"
                variant="outline"
              >
                Back to Requests
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Request">
      <div className="space-y-6">
        <BreadCrumb lastCrumbLabel={request.requestId} />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/medical-records-requests")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Medical Records Request</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500">ID:</p>
                    <p className="text-sm font-mono font-semibold text-burgundy">{request.requestId}</p>
                  </div>
                </div>
              </div>
              <div>
                {getStatusBadge(request.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Patient Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Patient Information</h3>
                      <p className="text-xs text-slate-500">Demographic and identification details</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <p className="text-sm font-medium text-slate-800 mt-1">{request.patientFullName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <IdCard className="h-3 w-3" /> Civil ID
                        </label>
                        <p className="text-sm text-slate-700 mt-1">{request.civilId}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Passport / Valid Government ID
                      </label>

                      <div className="mt-2">
                        {request.passportOrGovernmentId ? (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                <FileText size={20} className="text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 break-all">
                                  {getFileNameFromUrl(request.passportOrGovernmentId)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button
                                onClick={() =>
                                  handleDownloadDocument(
                                    request.passportOrGovernmentId!,
                                    `Passport_${request.patientFullName}`
                                  )
                                }
                                className="gap-2 bg-burgundy hover:bg-burgundy/90"
                                size="sm"
                              >
                                <Download size={14} />
                                Open Document
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">Not provided</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Patient File No. (URN)</label>
                        <p className="text-sm font-mono text-slate-700 mt-1">{request.patientFileNo}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Date of Birth
                        </label>
                        <p className="text-sm text-slate-700 mt-1">{request.dateOfBirth ? formatDateOnly(request.dateOfBirth) : "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requested By Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Requested By</h3>
                      <p className="text-xs text-slate-500">Who made this request</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Requestor Type</label>
                      <p className="text-sm font-medium text-slate-800 mt-1">{request.requestedBy}</p>
                    </div>
                    {request.requestedBy === "Patient" && request.patientNameConfirmation && (
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">E-Signature (Patient Name Confirmation)</label>
                        <p className="text-sm text-slate-700 mt-1 font-serif italic">{request.patientNameConfirmation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Specific Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Information Authorized for Release</h3>
                      <p className="text-xs text-slate-500">Documents and records requested</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Authorization Type</label>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-burgundy/10 text-burgundy">
                          <FileText className="h-3 w-3" />
                          {request.specificAuthorization}
                        </span>
                      </div>
                    </div>
                    {request.specificDateOfService && (
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Specific Date of Service</label>
                        <p className="text-sm text-slate-700 mt-1">{formatDateOnly(request.specificDateOfService)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Information Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Recipient Information & Purpose</h3>
                      <p className="text-xs text-slate-500">Where the records will be sent</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recipient Name</label>
                      <p className="text-sm font-medium text-slate-800 mt-1">{request.recipientName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email Address
                        </label>
                        <p className="text-sm text-slate-700 mt-1">{request.recipientEmailAddress}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Contact Number
                        </label>
                        <p className="text-sm text-slate-700 mt-1">{request.recipientContactNumber}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Purpose of Disclosure</label>
                      <p className="text-sm text-slate-700 mt-1">{request.purposeOfDisclosure}</p>
                      {request.otherPurpose && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs text-amber-700">
                            <span className="font-semibold">Other Reason:</span> {request.otherPurpose}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Request Metadata */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Request Information</h3>
                      <p className="text-xs text-slate-500">Submission and processing details</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Request ID</label>
                      <p className="text-sm font-mono font-semibold text-burgundy mt-1">{request.requestId}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Requested Date</label>
                      <p className="text-sm text-slate-700 mt-1">{formatDate(request.requestedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button
                onClick={() => setIsShareModalOpen(true)}
                className="gap-2"
              >
                Share via Mail
              </Button>

              <Button
                onClick={() => navigate("/medical-records-requests")}
                variant="outline"
                className="gap-2"
              >
                Back to Requests
              </Button>
            </div>

            {/* Share Email Modal */}
            {isShareModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    Share Medical Record
                  </h2>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Enter Email ID <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <p className="text-xs text-slate-400">
                      The medical record will be shared to this email address
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsShareModalOpen(false);
                        setShareEmail("");
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleShareViaEmail}
                      disabled={isSharing}
                    >
                      {isSharing ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewRequest;