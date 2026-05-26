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
  acceptRequest,
  cancelRequest,
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

// Mock Data
const initialRequests: AppointmentRequest[] = [
  { id: "1", fullName: "Sarah Al-Mutairi", phone: "+965 5501 1234", dateOfBirth: "1992-03-15", gender: "Female", department: "Obstetrics & Gynecology", doctorName: "Dr. Fatima Al-Zayed", symptoms: "Severe abdominal pain, irregular bleeding", urgency: "normal", status: "pending", preferredDate: "2024-12-20", timeSlot: { period: "morning", time: "10:00 AM" } },
  { id: "2", fullName: "James Wilson", phone: "+44 7700 900123", dateOfBirth: "1965-08-22", gender: "Male", department: "Cardiology", doctorName: "Dr. Ahmed Al-Rashid", symptoms: "Chest pain, shortness of breath", urgency: "urgent", status: "confirmed", comments: "Emergency case, priority appointment scheduled", preferredDate: "2024-12-15", timeSlot: { period: "morning", time: "09:00 AM" } },
  { id: "3", fullName: "Noura Al-Rashidi", phone: "+965 5502 3456", dateOfBirth: "1988-11-30", gender: "Female", department: "Dermatology", doctorName: "Dr. Layla Hassan", symptoms: "Skin rash, itching", urgency: "routine", status: "cancelled", comments: "Patient requested reschedule", preferredDate: "2024-12-18", timeSlot: { period: "afternoon", time: "02:00 PM" } },
  { id: "4", fullName: "Maria Garcia", phone: "+34 612 345 678", dateOfBirth: "2022-04-15", gender: "Female", department: "Pediatrics", doctorName: "Dr. Sami Karam", symptoms: "High fever, persistent cough", urgency: "urgent", status: "pending", preferredDate: "2024-12-21", timeSlot: { period: "morning", time: "11:00 AM" } },
  { id: "5", fullName: "Khalid Ibrahim", phone: "+965 5503 4567", dateOfBirth: "1975-06-10", gender: "Male", department: "Orthopedics", doctorName: "Dr. Youssef Mansour", symptoms: "Knee pain after injury", urgency: "normal", status: "confirmed", preferredDate: "2024-12-16", timeSlot: { period: "afternoon", time: "03:00 PM" } },
];

const initialBookings: Booking[] = [
  { id: "1", civilId: "295031234567", fullName: "Ahmed Al-Mutairi", dateOfBirth: "1985-05-20", nationality: "Kuwaiti", gender: "Male", passportNumber: "KUW1234567", symptoms: "Back pain", department: "Orthopedics", doctorName: "Dr. Khalid Al-Otaibi", appointmentDate: "2024-12-15", timeSlot: "10:00 AM" },
  { id: "2", civilId: "289112345678", fullName: "Mona Al-Sabah", dateOfBirth: "1990-11-12", nationality: "Kuwaiti", gender: "Female", passportNumber: "KUW2345678", department: "Dermatology", doctorName: "Dr. Noura Al-Fares", appointmentDate: "2024-12-16", timeSlot: "02:00 PM" },
  { id: "3", civilId: "302154321098", fullName: "John Smith", dateOfBirth: "1978-03-25", nationality: "British", gender: "Male", passportNumber: "GBR9876543", symptoms: "Chest pain", department: "Cardiology", doctorName: "Dr. Ahmed Al-Rashid", appointmentDate: "2024-12-14", timeSlot: "09:00 AM" },
  { id: "4", civilId: "289998887777", fullName: "Fatima Al-Zayed", dateOfBirth: "1992-08-15", nationality: "Kuwaiti", gender: "Female", passportNumber: "KUW3456789", department: "Pediatrics", doctorName: "Dr. Sami Karam", appointmentDate: "2024-12-18", timeSlot: "11:00 AM" },
  { id: "5", civilId: "303456789012", fullName: "Robert Brown", dateOfBirth: "1982-12-03", nationality: "American", gender: "Male", passportNumber: "USA1234567", symptoms: "High blood pressure", department: "Cardiology", doctorName: "Dr. Ahmed Al-Rashid", appointmentDate: "2024-12-20", timeSlot: "03:00 PM" },
];

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
  clearFilters: () => void;
}) => {
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          {showStatusFilter && statuses && (
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
      {(filters.fromDate || filters.toDate || filters.department || filters.doctor || filters.status) && (
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
          {filters.department && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Dept: {filters.department}
              <button onClick={() => setFilters({ ...filters, department: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.doctor && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-slate-200">
              Doctor: {filters.doctor}
              <button onClick={() => setFilters({ ...filters, doctor: "" })} className="hover:text-red-500">
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.status && (
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
  onStatusChange 
}: { 
  requests: AppointmentRequest[]; 
  loading: boolean; 
  onStatusChange: (id: string, newStatus: string, comment: string) => Promise<void>;
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
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    department: "",
    doctor: "",
    status: "",
  });

  // Get unique values for filters
  const departments = [...new Set(requests.map(r => r.department).filter(Boolean))];
  const doctors = [...new Set(requests.map(r => r.doctorName).filter(Boolean))];
  const statuses = ["pending", "confirmed", "cancelled"];

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const dateToCheck = req.preferredDate;
    
    // Date range filter
    if (filters.fromDate && dateToCheck) {
      const requestDate = new Date(dateToCheck);
      const fromDate = new Date(filters.fromDate);
      if (requestDate < fromDate) return false;
    }
    if (filters.toDate && dateToCheck) {
      const requestDate = new Date(dateToCheck);
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59);
      if (requestDate > toDate) return false;
    }
    
    // Department filter
    if (filters.department && req.department !== filters.department) return false;
    
    // Doctor filter
    if (filters.doctor && req.doctorName !== filters.doctor) return false;
    
    // Status filter
    if (filters.status && req.status !== filters.status) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      department: "",
      doctor: "",
      status: "",
    });
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
        clearFilters={clearFilters}
      />

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No appointment requests found matching filters</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
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
  loading 
}: { 
  bookings: Booking[]; 
  loading: boolean;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    department: "",
    doctor: "",
  });

  // Get unique departments and doctors for filters
  const departments = [...new Set(bookings.map(b => b.department).filter(Boolean))];
  const doctors = [...new Set(bookings.map(b => b.doctorName).filter(Boolean))];

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    // Date range filter
    if (filters.fromDate && booking.appointmentDate) {
      const bookingDate = new Date(booking.appointmentDate);
      const fromDate = new Date(filters.fromDate);
      if (bookingDate < fromDate) return false;
    }
    if (filters.toDate && booking.appointmentDate) {
      const bookingDate = new Date(booking.appointmentDate);
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59);
      if (bookingDate > toDate) return false;
    }
    
    // Department filter
    if (filters.department && booking.department !== filters.department) return false;
    
    // Doctor filter
    if (filters.doctor && booking.doctorName !== filters.doctor) return false;
    
    return true;
  });

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
        clearFilters={clearFilters}
      />

      {/* Results Count */}
      <div className="text-sm text-slate-500">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No bookings found matching filters</p>
        </div>
      ) : (
        filteredBookings.map((booking) => (
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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"requests" | "bookings">("requests");
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    // Fetch appointment requests
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await getAppointmentRequests(1, 100);
        const list = res?.data ?? res?.requests ?? res ?? [];
        setRequests(Array.isArray(list) ? list : initialRequests);
      } catch {
        setRequests(initialRequests);
      } finally {
        setLoadingRequests(false);
      }
    };

    // Fetch bookings
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        // Replace with actual API call
        // const res = await getBookings();
        // setBookings(res.data);
        await new Promise(resolve => setTimeout(resolve, 500));
        setBookings(initialBookings);
      } catch {
        setBookings(initialBookings);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchRequests();
    fetchBookings();
  }, []);

  const handleRequestStatusChange = async (id: string, newStatus: string, comment: string) => {
    // Replace with actual API call
    // await updateRequestStatus(id, newStatus, comment);
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: newStatus as any, comments: comment } : r
    ));
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
              />
            )}

            {activeTab === "bookings" && (
              <BookingsList 
                bookings={bookings}
                loading={loadingBookings}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppointmentRequests;