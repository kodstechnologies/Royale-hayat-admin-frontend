// AppointmentRequests.tsx
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, ChevronUp, User, Phone, Calendar, Users, CheckCircle, XCircle, Clock, Check, X, AlertCircle, Stethoscope, Building, UserCircle, MessageSquare, Search, Filter, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getAppointmentRequests,
  getAppointmentBookings,
  acceptRequest,
  cancelRequest,
  type AppointmentListFilters,
} from "@/api/appointmentRequest";

// Types
type AppointmentRequest = {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  department?: string;
  doctorName?: string;
  symptoms?: string;
  urgency?: "urgent" | "normal" | "routine";
  status: "pending" | "confirmed" | "cancelled";
  preferredDate?: string;
  additionalNotes?: string;
  comments?: string;
  timeSlot?: { period: string; time: string };
};

type Booking = {
  id: string;
  civilId: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  passportNumber: string;
  symptoms?: string;
  department?: string;
  doctorName?: string;
  appointmentDate?: string;
  timeSlot?: string;
};

type ListFilters = {
  fromDate: string;
  toDate: string;
  department: string;
  doctor: string;
  status: string;
};

const defaultListFilters: ListFilters = {
  fromDate: "",
  toDate: "",
  department: "",
  doctor: "",
  status: "",
};

const formatDob = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().split("T")[0];
};

const formatSymptoms = (symptoms?: string[] | string) => {
  if (!symptoms) return "";
  return Array.isArray(symptoms) ? symptoms.join(", ") : symptoms;
};

const mapApiStatusToUi = (
  status?: string,
): AppointmentRequest["status"] => {
  if (status === "accepted") return "confirmed";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

const mapUiStatusToApi = (
  status: string,
): AppointmentListFilters["status"] => {
  if (!status) return "all";
  if (status === "confirmed") return "accepted";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

const mapRequestFromApi = (row: Record<string, unknown>): AppointmentRequest => ({
  id: String(row._id ?? row.id ?? ""),
  fullName: String(row.fullname ?? row.fullName ?? ""),
  phone: String(row.phone ?? row.mobile_number ?? ""),
  dateOfBirth: formatDob(String(row.dob ?? row.dateOfBirth ?? "")),
  gender: String(row.gender ?? ""),
  department: row.department ? String(row.department) : undefined,
  doctorName: row.doctor ? String(row.doctor) : undefined,
  symptoms: formatSymptoms(row.symptoms as string[] | string | undefined),
  status: mapApiStatusToUi(row.status ? String(row.status) : undefined),
  preferredDate: row.date ? String(row.date) : undefined,
  timeSlot: row.time
    ? { period: "", time: String(row.time) }
    : undefined,
  additionalNotes: row.additionalNotes
    ? String(row.additionalNotes)
    : undefined,
});

const mapBookingFromApi = (row: Record<string, unknown>): Booking => ({
  id: String(row._id ?? row.id ?? ""),
  civilId: String(row.national_id ?? row.civilId ?? ""),
  fullName: String(row.fullname ?? row.fullName ?? ""),
  dateOfBirth: formatDob(String(row.dob ?? row.dateOfBirth ?? "")),
  nationality: String(row.nationality ?? ""),
  gender: String(row.gender ?? ""),
  passportNumber: String(row.passportNumber ?? ""),
  symptoms: formatSymptoms(row.symptoms as string[] | string | undefined),
  department: row.department ? String(row.department) : undefined,
  doctorName: row.doctor ? String(row.doctor) : undefined,
  appointmentDate: row.date ? String(row.date) : undefined,
  timeSlot: row.time ? String(row.time) : undefined,
});

const statusStyles: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending: { color: "text-amber-700", bg: "bg-amber-100", icon: Clock, label: "Pending" },
  confirmed: { color: "text-green-700", bg: "bg-green-100", icon: CheckCircle, label: "Confirmed" },
  cancelled: { color: "text-red-700", bg: "bg-red-100", icon: XCircle, label: "Cancelled" },
};

// Status Update Modal Component
const StatusUpdateModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentStatus, 
  itemName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (comment: string) => void; 
  currentStatus: string; 
  itemName: string;
}) => {
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-2">Update Status</h3>
        <p className="text-sm text-slate-600 mb-4">
          Change status for <span className="font-semibold">{itemName}</span> to{" "}
          <span className="font-semibold">{currentStatus}</span>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments or notes..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(comment)}>
            Confirm Status Change
          </Button>
        </div>
      </div>
    </div>
  );
};

// Filter Component for Reusability
const FilterSection = ({ 
  showFilters, 
  setShowFilters, 
  filters, 
  setFilters, 
  departments, 
  doctors, 
  statuses,
  showStatusFilter = false,
  hasData = false,
  clearFilters 
}: { 
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: any;
  setFilters: (filters: any) => void;
  departments: string[];
  doctors: string[];
  statuses?: string[];
  showStatusFilter?: boolean;
  hasData?: boolean;
  clearFilters: () => void;
}) => {
  const showFacetFilters = hasData;
  const filterGridClass = showFacetFilters
    ? showStatusFilter
      ? "mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      : "mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    : "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4";
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-burgundy transition-colors"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className={filterGridClass}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
            />
          </div>
          {showFacetFilters && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}
          {showFacetFilters && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Doctor</label>
              <select
                value={filters.doctor}
                onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
          )}
          {showFacetFilters && showStatusFilter && statuses && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {(filters.fromDate ||
        filters.toDate ||
        (showFacetFilters &&
          (filters.department || filters.doctor || filters.status))) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.fromDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              From: {formatDate(filters.fromDate)}
              <button onClick={() => setFilters({ ...filters, fromDate: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.toDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              To: {formatDate(filters.toDate)}
              <button onClick={() => setFilters({ ...filters, toDate: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.department && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Dept: {filters.department}
              <button onClick={() => setFilters({ ...filters, department: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.doctor && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Doctor: {filters.doctor}
              <button onClick={() => setFilters({ ...filters, doctor: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {showFacetFilters && filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <button onClick={() => setFilters({ ...filters, status: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-burgundy hover:underline"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

// Appointment Requests Component
const AppointmentRequestsList = ({ 
  requests, 
  loading, 
  onStatusChange,
  filters,
  setFilters,
}: { 
  requests: AppointmentRequest[]; 
  loading: boolean; 
  onStatusChange: (id: string, newStatus: string, comment: string) => Promise<void>;
  filters: ListFilters;
  setFilters: React.Dispatch<React.SetStateAction<ListFilters>>;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; id: string; newStatus: string; name: string }>({
    isOpen: false,
    id: "",
    newStatus: "",
    name: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const departments = [...new Set(requests.map(r => r.department).filter(Boolean))] as string[];
  const doctors = [...new Set(requests.map(r => r.doctorName).filter(Boolean))] as string[];
  const statuses = ["pending", "confirmed", "cancelled"];

  const clearFilters = () => {
    setFilters({ ...defaultListFilters });
  };

  const handleStatusUpdate = async (comment: string) => {
    setActionLoading(statusModal.id);
    try {
      await onStatusChange(statusModal.id, statusModal.newStatus, comment);
      toast.success(`Request ${statusModal.newStatus} successfully`);
      setStatusModal({ isOpen: false, id: "", newStatus: "", name: "" });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "—";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filters Section */}
      <FilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        departments={departments}
        doctors={doctors}
        statuses={statuses}
        showStatusFilter={true}
        hasData={requests.length > 0}
        clearFilters={clearFilters}
      />

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {requests.length} request{requests.length === 1 ? "" : "s"}
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No appointment requests found matching filters</p>
          </div>
        ) : (
          requests.map((req) => {
            const StatusIcon = statusStyles[req.status].icon;
            const isActioning = actionLoading === req.id;
            
            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                      <span className="text-burgundy font-semibold text-sm">{getInitials(req.fullName)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{req.fullName}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{req.phone}</span>
                        </div>
                        <span className="text-xs text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{req.preferredDate ? formatDate(req.preferredDate) : "Date not set"}</span>
                        </div>
                        {req.timeSlot && (
                          <>
                            <span className="text-xs text-slate-300">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{req.timeSlot.time}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[req.status].bg} ${statusStyles[req.status].color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusStyles[req.status].label}
                    </span>
                    {expanded === req.id ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {expanded === req.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-burgundy" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{req.fullName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-burgundy" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                        </div>
                        <p className="text-sm text-slate-700">{req.phone}</p>
                      </div>
                      {req.dateOfBirth && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-burgundy" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</span>
                          </div>
                          <p className="text-sm text-slate-700">{formatDate(req.dateOfBirth)} ({getAge(req.dateOfBirth)} years)</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-burgundy" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</span>
                        </div>
                        <p className="text-sm text-slate-700">{req.gender}</p>
                      </div>
                      {req.symptoms && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-3.5 w-3.5 text-burgundy" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Symptoms</span>
                          </div>
                          <p className="text-sm text-slate-700">{req.symptoms}</p>
                        </div>
                      )}
                      {req.department && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-burgundy" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                          </div>
                          <p className="text-sm text-slate-700">{req.department}</p>
                        </div>
                      )}
                      {req.doctorName && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-3.5 w-3.5 text-burgundy" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor Name</span>
                          </div>
                          <p className="text-sm text-slate-700">{req.doctorName}</p>
                        </div>
                      )}
                      {req.preferredDate && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Date</span>
                          <p className="text-sm text-slate-700">{formatDate(req.preferredDate)}</p>
                        </div>
                      )}
                      {req.timeSlot && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Slot</span>
                          <p className="text-sm text-slate-700 capitalize">{req.timeSlot.period} — {req.timeSlot.time}</p>
                        </div>
                      )}
                      {req.additionalNotes && (
                        <div className="space-y-2 md:col-span-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Notes</span>
                          <p className="text-sm text-slate-700">{req.additionalNotes}</p>
                        </div>
                      )}
                      {req.comments && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-burgundy" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comments</span>
                          </div>
                          <p className="text-sm text-slate-700 italic">{req.comments}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      {req.status !== "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActioning}
                          onClick={() => setStatusModal({
                            isOpen: true,
                            id: req.id,
                            newStatus: "confirmed",
                            name: req.fullName,
                          })}
                          className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isActioning ? "Processing..." : "Confirm Request"}
                        </Button>
                      )}
                      {req.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActioning}
                          onClick={() => setStatusModal({
                            isOpen: true,
                            id: req.id,
                            newStatus: "cancelled",
                            name: req.fullName,
                          })}
                          className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800"
                        >
                          <X className="h-3.5 w-3.5" />
                          {isActioning ? "Processing..." : "Cancel Request"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <StatusUpdateModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, id: "", newStatus: "", name: "" })}
        onConfirm={handleStatusUpdate}
        currentStatus={statusModal.newStatus}
        itemName={statusModal.name}
      />
    </>
  );
};

// Bookings Component
const BookingsList = ({ 
  bookings, 
  loading,
  filters,
  setFilters,
}: { 
  bookings: Booking[]; 
  loading: boolean;
  filters: Omit<ListFilters, "status">;
  setFilters: React.Dispatch<React.SetStateAction<Omit<ListFilters, "status">>>;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const departments = [...new Set(bookings.map(b => b.department).filter(Boolean))] as string[];
  const doctors = [...new Set(bookings.map(b => b.doctorName).filter(Boolean))] as string[];

  const clearFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      department: "",
      doctor: "",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "—";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <FilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        departments={departments}
        doctors={doctors}
        showStatusFilter={false}
        hasData={bookings.length > 0}
        clearFilters={clearFilters}
      />

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {bookings.length} booking{bookings.length === 1 ? "" : "s"}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No bookings found matching filters</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              onClick={() => setExpanded(expanded === booking.id ? null : booking.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <span className="text-burgundy font-semibold text-sm">{getInitials(booking.fullName)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{booking.fullName}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">Civil ID: {booking.civilId}</span>
                    </div>
                    <span className="text-xs text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{booking.appointmentDate ? formatDate(booking.appointmentDate) : "Date not set"}</span>
                    </div>
                    {booking.timeSlot && (
                      <>
                        <span className="text-xs text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{booking.timeSlot}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {expanded === booking.id ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </div>
            </div>

            {expanded === booking.id && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-burgundy" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Civil ID</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{booking.civilId}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-burgundy" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{booking.fullName}</p>
                  </div>
                  {booking.dateOfBirth && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-burgundy" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</span>
                      </div>
                      <p className="text-sm text-slate-700">{formatDate(booking.dateOfBirth)} ({getAge(booking.dateOfBirth)} years)</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-burgundy" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nationality</span>
                    </div>
                    <p className="text-sm text-slate-700">{booking.nationality}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-burgundy" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</span>
                    </div>
                    <p className="text-sm text-slate-700">{booking.gender}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-burgundy" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passport Number</span>
                    </div>
                    <p className="text-sm text-slate-700">{booking.passportNumber}</p>
                  </div>
                  {booking.symptoms && (
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3.5 w-3.5 text-burgundy" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Symptoms</span>
                      </div>
                      <p className="text-sm text-slate-700">{booking.symptoms}</p>
                    </div>
                  )}
                  {booking.department && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-burgundy" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                      </div>
                      <p className="text-sm text-slate-700">{booking.department}</p>
                    </div>
                  )}
                  {booking.doctorName && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5 text-burgundy" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor Name</span>
                      </div>
                      <p className="text-sm text-slate-700">{booking.doctorName}</p>
                    </div>
                  )}
                  {booking.appointmentDate && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointment Date</span>
                      <p className="text-sm text-slate-700">{formatDate(booking.appointmentDate)}</p>
                    </div>
                  )}
                  {booking.timeSlot && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Slot</span>
                      <p className="text-sm text-slate-700">{booking.timeSlot}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Main Component
const AppointmentRequests = () => {
  useLanguage();
  const [activeTab, setActiveTab] = useState<"requests" | "bookings">("requests");
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [requestFilters, setRequestFilters] = useState<ListFilters>(defaultListFilters);
  const [bookingFilters, setBookingFilters] = useState<Omit<ListFilters, "status">>({
    fromDate: "",
    toDate: "",
    department: "",
    doctor: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await getAppointmentRequests(1, 100, {
        fromDate: requestFilters.fromDate || undefined,
        toDate: requestFilters.toDate || undefined,
        department: requestFilters.department || undefined,
        doctor: requestFilters.doctor || undefined,
        status: mapUiStatusToApi(requestFilters.status),
      });
      const list = res?.data ?? [];
      setRequests(
        Array.isArray(list)
          ? list.map((row) => mapRequestFromApi(row as Record<string, unknown>))
          : [],
      );
    } catch {
      toast.error("Failed to load appointment requests");
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [requestFilters]);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await getAppointmentBookings(1, 100, {
        fromDate: bookingFilters.fromDate || undefined,
        toDate: bookingFilters.toDate || undefined,
        department: bookingFilters.department || undefined,
        doctor: bookingFilters.doctor || undefined,
      });
      const list = res?.data ?? [];
      setBookings(
        Array.isArray(list)
          ? list.map((row) => mapBookingFromApi(row as Record<string, unknown>))
          : [],
      );
    } catch {
      toast.error("Failed to load appointment bookings");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, [bookingFilters]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const handleRequestStatusChange = async (id: string, newStatus: string, comment: string) => {
    if (newStatus === "confirmed") {
      await acceptRequest(id);
    } else if (newStatus === "cancelled") {
      await cancelRequest(id);
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus as AppointmentRequest["status"],
              comments: comment || r.comments,
            }
          : r,
      ),
    );

    await fetchRequests();
    await fetchBookings();
  };

  const stats = {
    requests: {
      pending: requests.filter(r => r.status === "pending").length,
      confirmed: requests.filter(r => r.status === "confirmed").length,
      cancelled: requests.filter(r => r.status === "cancelled").length,
    },
  };

  return (
    <AdminLayout title="Appointment Management">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                activeTab === "requests"
                  ? "text-burgundy border-b-2 border-burgundy"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Appointment Requests
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                {requests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                activeTab === "bookings"
                  ? "text-burgundy border-b-2 border-burgundy"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Bookings
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                {bookings.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Stats Overview - Only for Requests Tab */}
        {activeTab === "requests" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Pending Requests</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.requests.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Confirmed Requests</p>
                  <p className="text-2xl font-bold text-green-600">{stats.requests.confirmed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Cancelled Requests</p>
                  <p className="text-2xl font-bold text-red-600">{stats.requests.cancelled}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {activeTab === "requests" ? "Appointment Requests" : "Patient Bookings"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {activeTab === "requests" 
                  ? "View and manage patient appointment requests - filter by date, department, doctor, or status" 
                  : "View all patient bookings - filter by date range, department, or doctor"}
              </p>
            </div>

            {activeTab === "requests" && (
              <AppointmentRequestsList 
                requests={requests}
                loading={loadingRequests}
                onStatusChange={handleRequestStatusChange}
                filters={requestFilters}
                setFilters={setRequestFilters}
              />
            )}

            {activeTab === "bookings" && (
              <BookingsList 
                bookings={bookings}
                loading={loadingBookings}
                filters={bookingFilters}
                setFilters={setBookingFilters}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppointmentRequests;