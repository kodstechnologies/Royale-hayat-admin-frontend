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
  FileCheck,
  Download,
  CheckCircle,
  Clock,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { GetMedicalRequestById, ShareViaMail } from "@/api/medicalRecordRequest";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";
import {
  formatDateOnly,
  formatDateTime,
  mapDetail,
  type MedicalRecordRequestDetail,
} from "./medicalRecordRequestUtils";

const DEFAULT_SHARE_EMAILS =
  "medicalrecords@royalehayat.com,marketing@royalehayat.com";

type ShareLanguage = "en" | "ar";

const DetailField = ({
  label,
  value,
  mono,
  italic,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  italic?: boolean;
}) => (
  <div>
    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <p
      className={`text-sm text-slate-800 mt-1 break-words ${
        mono ? "font-mono" : "font-medium"
      } ${italic ? "font-serif italic font-normal" : ""}`}
    >
      {value?.trim() ? value : "—"}
    </p>
  </div>
);

const AttachmentButton = ({
  url,
  label,
}: {
  url?: string;
  label: string;
}) => {
  if (!url?.trim()) return null;

  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        <FileText className="h-3 w-3" /> {label}
      </label>
      <div className="mt-2">
        <Button
          type="button"
          onClick={() => {
            window.open(url, "_blank", "noopener,noreferrer");
            toast.success("Opening document in new tab");
          }}
          className="gap-2 bg-burgundy hover:bg-burgundy/90 w-full sm:w-auto"
          size="sm"
        >
          <Download size={14} />
          Open Document
        </Button>
      </div>
    </div>
  );
};

const ViewRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<MedicalRecordRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState(DEFAULT_SHARE_EMAILS);
  const [shareEnglish, setShareEnglish] = useState(true);
  const [shareArabic, setShareArabic] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useScrollToTop(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    GetMedicalRequestById(id)
      .then((res) => {
        const d = (res?.data ?? res) as Record<string, unknown>;
        if (!d || typeof d !== "object") {
          setRequest(null);
          return;
        }
        setRequest(mapDetail(d, id));
      })
      .catch(() => {
        setRequest(null);
        toast.error("Failed to load request details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleShareViaEmail = async () => {
    if (!hasPermission(PERMISSIONS.MRR_SHARE_VIA_EMAIL)) {
      toast.error("You do not have permission to share medical records via email");
      return;
    }
    if (!shareEmail.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    if (!shareEnglish && !shareArabic) {
      toast.error("Select at least one email language (English or Arabic)");
      return;
    }
    if (!id) {
      toast.error("Request ID not found");
      return;
    }

    const recipients = shareEmail
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmail = recipients.find((email) => !emailRegex.test(email));

    if (recipients.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    if (invalidEmail) {
      toast.error(`Invalid email address: ${invalidEmail}`);
      return;
    }

    const languages: ShareLanguage[] = [];
    if (shareEnglish) languages.push("en");
    if (shareArabic) languages.push("ar");

    setIsSharing(true);
    try {
      const response = await ShareViaMail(id, {
        emailId: recipients.join(","),
        languages,
      });

      toast.success(
        response?.message ||
          `Medical record shared successfully to ${recipients.join(", ")}`,
      );
      setIsShareModalOpen(false);
      setShareEmail(DEFAULT_SHARE_EMAILS);
      setShareEnglish(true);
      setShareArabic(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.response?.status === 404) {
        toast.error("Request not found");
      } else {
        toast.error("Failed to share medical record. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const getStatusBadge = (status: MedicalRecordRequestDetail["status"]) => {
    const statusConfig = {
      pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "New" },
      received: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Viewed" },
    };
    const config = statusConfig[status] ?? statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="View Request">
        <div className="space-y-4 sm:space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4" />
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
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
            <div className="p-4 sm:p-6 text-center py-12 sm:py-16">
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

  const isCivilId = request.validIdentification === "civilId";
  const isPassportId = request.validIdentification === "passportORGovtId";
  const isSpecificDocuments = request.specificAuthorization === "specific documents";
  const isPatientRequestor = request.requestedBy === "Patient";
  const isLegalRep = request.requestedBy === "Legal Representative";

  return (
    <AdminLayout title="View Request">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb lastCrumbLabel={request.mrrId} />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate("/medical-records-requests")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                  aria-label="Back to requests"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
                    Medical Records Request
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Complete submission from the patient authorization form
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-burgundy break-all mt-1">
                    {request.mrrId}
                  </p>
                </div>
              </div>
              <div className="shrink-0 sm:pt-1">{getStatusBadge(request.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <SummaryChip label="Patient" value={request.patientFullName} />
              <SummaryChip label="Authorization" value={request.authorizationLabel} />
              <SummaryChip label="Service Period" value={request.servicePeriod} />
              <SummaryChip label="Requested By" value={request.requestedBy} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Section
                title="Patient Information"
                description="Demographic and identification details"
                icon={User}
              >
                <DetailField label="Full Name" value={request.patientFullName} />
                <DetailField
                  label="Patient File No. (URN)"
                  value={request.patientFileNo}
                  mono
                />
                <DetailField
                  label="Date of Birth"
                  value={formatDateOnly(request.dateOfBirth)}
                />
                <DetailField
                  label="Identification Type"
                  value={request.identificationLabel}
                />
                {isCivilId && (
                  <DetailField label="Civil ID Number" value={request.civilIdNumber} mono />
                )}
                <AttachmentButton
                  url={isCivilId ? request.civilIdAttachment : undefined}
                  label="Civil ID Attachment"
                />
                <AttachmentButton
                  url={isPassportId ? request.passportOrGovernmentIdAttachment : undefined}
                  label="Passport / Government ID Attachment"
                />
              </Section>

              <Section
                title="Authorization & Records Requested"
                description="Information the patient authorized for release"
                icon={FileCheck}
              >
                <DetailField
                  label="Authorization Type"
                  value={request.authorizationLabel}
                />
                <DetailField label="Service Period (From → To)" value={request.servicePeriod} />
                <DetailField
                  label="Service From Date"
                  value={formatDateOnly(request.specificFromDate)}
                />
                <DetailField
                  label="Service To Date"
                  value={formatDateOnly(request.specificToDate)}
                />
                {isSpecificDocuments ? (
                  <DetailField
                    label="Document Types"
                    value={request.documentTypesLabel}
                  />
                ) : (
                  <DetailField label="Document Types" value="—" />
                )}
                <DetailField label="Special Request" value={request.specialRequest} />
              </Section>

              <Section
                title="Recipient & Purpose"
                description="Where records will be sent and why"
                icon={Building2}
              >
                <DetailField label="Recipient Name" value={request.recipientName} />
                <DetailField
                  label="Recipient Email"
                  value={request.recipientEmailAddress}
                />
                <DetailField
                  label="Recipient Contact Number"
                  value={request.recipientContactNumber}
                />
                <DetailField label="Purpose of Disclosure" value={request.purposeLabel} />
                {request.purposeOfDisclosure === "Others" && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
                      Other Purpose (specified)
                    </p>
                    <p className="text-sm text-amber-900">{request.otherPurpose || "—"}</p>
                  </div>
                )}
              </Section>

              <Section
                title="Requested By & Signature"
                description="Who submitted the form and electronic signature"
                icon={UserCheck}
              >
                <DetailField label="Requestor Type" value={request.requestedBy} />
                {isPatientRequestor && (
                  <DetailField
                    label="E-Signature (Patient Full Name)"
                    value={request.patientNameConfirmation}
                    italic
                  />
                )}
                {isLegalRep && (
                  <>
                    <DetailField
                      label="Legal Representative Full Name"
                      value={request.legalRepresentativeFullName}
                    />
                    <DetailField
                      label="Relationship to Patient"
                      value={request.relationshipWithPatient}
                    />
                    <AttachmentButton
                      url={request.validProof}
                      label="Government ID / Valid Proof"
                    />
                  </>
                )}
              </Section>

              <Section
                title="Submission Details"
                description="Request tracking information"
                icon={ClipboardList}
                className="lg:col-span-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetailField label="MRR ID" value={request.mrrId} mono />
                  <DetailField
                    label="Submitted On"
                    value={formatDateTime(request.requestedDate)}
                  />
                  <DetailField
                    label="Last Updated"
                    value={formatDateTime(request.updatedAt)}
                  />
                  <DetailField
                    label="Admin Status"
                    value={request.isViewed ? "Viewed by admin" : "Not yet viewed"}
                  />
                </div>
              </Section>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button
                onClick={() => navigate("/medical-records-requests")}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                Back to Requests
              </Button>
              {/* <PermissionGate permission={PERMISSIONS.MRR_SHARE_VIA_EMAIL}>
                <Button
                  onClick={() => {
                    setShareEmail(DEFAULT_SHARE_EMAILS);
                    setShareEnglish(true);
                    setShareArabic(true);
                    setIsShareModalOpen(true);
                  }}
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
                >
                  <Mail className="h-4 w-4" />
                  Share via Mail
                </Button>
              </PermissionGate> */}
            </div>

            {isShareModalOpen && hasPermission(PERMISSIONS.MRR_SHARE_VIA_EMAIL) && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
                <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    Share Medical Record
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        Recipient email(s)
                      </label>
                      <textarea
                        value={shareEmail}
                        readOnly
                        rows={2}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-700 cursor-not-allowed resize-none min-h-[72px]"
                      />
                      <p className="text-xs text-slate-400">
                        View only. Email recipients cannot be edited.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        Email language <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shareEnglish}
                            onChange={(e) => setShareEnglish(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-burgundy focus:ring-burgundy"
                          />
                          English
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shareArabic}
                            onChange={(e) => setShareArabic(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-burgundy focus:ring-burgundy"
                          />
                          Arabic
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setIsShareModalOpen(false);
                        setShareEmail(DEFAULT_SHARE_EMAILS);
                        setShareEnglish(true);
                        setShareArabic(true);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => void handleShareViaEmail()}
                      disabled={isSharing}
                      className="w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
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

const Section = ({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: typeof User;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 ${className ?? ""}`}
  >
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-burgundy" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const SummaryChip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm min-w-0">
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-sm font-medium text-slate-800 mt-1 truncate" title={value}>
      {value}
    </p>
  </div>
);

export default ViewRequest;
