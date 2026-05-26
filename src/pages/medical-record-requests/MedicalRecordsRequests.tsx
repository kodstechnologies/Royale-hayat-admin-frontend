import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, FileText, Clock, CheckCircle } from "lucide-react";
import { getAllMedicalRequests } from "@/api/medicalRecordRequest";

const mockRequests = [
  { 
    id: "MRR-001", 
    patientName: "Ahmad Al-Sabah", 
    patientId: "P-10234", 
    email: "ahmad.sabah@email.com", 
    phone: "+965 9912 3456", 
    requestDate: "2026-04-12", 
    recordType: "Full Medical History", 
    department: "Cardiology", 
    purpose: "Insurance Claim", 
    status: "pending", 
    notes: "Urgent – needed for travel insurance",
    requestId: "MRR-001"
  },
  { 
    id: "MRR-002", 
    patientName: "Fatima Hassan", 
    patientId: "P-10567", 
    email: "fatima.h@email.com", 
    phone: "+965 6678 9012", 
    requestDate: "2026-04-11", 
    recordType: "Lab Results", 
    department: "Internal Medicine", 
    purpose: "Second Opinion", 
    status: "received", 
    notes: "Last 6 months lab work - Records have been sent",
    requestId: "MRR-002"
  },
  { 
    id: "MRR-003", 
    patientName: "Mohammed Al-Rashidi", 
    patientId: "P-10891", 
    email: "m.rashidi@email.com", 
    phone: "+965 5543 2109", 
    requestDate: "2026-04-10", 
    recordType: "Surgical Report", 
    department: "Orthopedics", 
    purpose: "Transfer to Another Hospital", 
    status: "received", 
    notes: "Knee replacement surgery records - Sent to receiving hospital",
    requestId: "MRR-003"
  },
  { 
    id: "MRR-004", 
    patientName: "Noura Al-Mutairi", 
    patientId: "P-11234", 
    email: "noura.m@email.com", 
    phone: "+965 9987 6543", 
    requestDate: "2026-04-09", 
    recordType: "Radiology Images", 
    department: "Radiology", 
    purpose: "Personal Records", 
    status: "pending", 
    notes: "MRI and CT scan images - Waiting for patient consent",
    requestId: "MRR-004"
  },
  { 
    id: "MRR-005", 
    patientName: "Khalid Bouarki", 
    patientId: "P-11567", 
    email: "khalid.b@email.com", 
    phone: "+965 6612 3456", 
    requestDate: "2026-04-08", 
    recordType: "Discharge Summary", 
    department: "General Surgery", 
    purpose: "Legal Request", 
    status: "pending", 
    notes: "Incomplete authorization form - Awaiting completion",
    requestId: "MRR-005"
  },
  { 
    id: "MRR-006", 
    patientName: "Sara Al-Enezi", 
    patientId: "P-11890", 
    email: "sara.enezi@email.com", 
    phone: "+965 5567 8901", 
    requestDate: "2026-04-07", 
    recordType: "Prescription History", 
    department: "Dermatology", 
    purpose: "Pharmacy Transfer", 
    status: "received", 
    notes: "All prescriptions from 2025 - Sent to pharmacy",
    requestId: "MRR-006"
  },
  { 
    id: "MRR-007", 
    patientName: "Ali Dashti", 
    patientId: "P-12123", 
    email: "ali.d@email.com", 
    phone: "+965 9923 4567", 
    requestDate: "2026-04-06", 
    recordType: "Vaccination Records", 
    department: "Pediatrics", 
    purpose: "School Enrollment", 
    status: "pending", 
    notes: "Child vaccination records needed - Being processed",
    requestId: "MRR-007"
  },
  { 
    id: "MRR-008", 
    patientName: "Maha Al-Kandari", 
    patientId: "P-12456", 
    email: "maha.k@email.com", 
    phone: "+965 6634 5678", 
    requestDate: "2026-04-05", 
    recordType: "Full Medical History", 
    department: "OB/GYN", 
    purpose: "Insurance Claim", 
    status: "received", 
    notes: "Maternity records 2025-2026 - Sent to insurance company",
    requestId: "MRR-008"
  },
];

type MedicalRequest = {
  id: string;
  patientName: string;
  patientId: string;
  requestDate: string;
  requestId: string;
  status: string;
  email?: string;
  phone?: string;
  recordType?: string;
  department?: string;
  purpose?: string;
  notes?: string;
};

// Helper: map API response → MedicalRequest and generate MRR ID if needed
const mapApiRequest = (r: any): MedicalRequest => {
  // Check if we already have a proper MRR ID
  let requestId = r.requestId || r.id;
  
  // If the ID doesn't start with MRR, generate one
  if (!requestId || !requestId.toString().startsWith("MRR-")) {
    // Try to extract number from existing ID or use timestamp
    let num = 1;
    if (r._id) {
      // Use hash of mongo ID to generate a number
      const hash = r._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      num = (hash % 1000) + 1;
    } else {
      num = Date.now() % 1000;
    }
    requestId = `MRR-${num.toString().padStart(3, '0')}`;
  }
  
  return {
    id: r._id ?? r.id ?? requestId,
    patientName: r.patientFullName ?? r.patientName ?? "—",
    patientId: r.patientFileNo ?? r.patientId ?? "—",
    requestDate: r.createdAt ? r.createdAt.split("T")[0] : (r.requestDate ?? new Date().toISOString().split("T")[0]),
    requestId: requestId,
    status: r.status ?? "pending",
    email: r.email,
    phone: r.phone,
    recordType: r.recordType,
    department: r.department,
    purpose: r.purpose,
    notes: r.notes,
  };
};

// Function to generate a new MRR ID based on existing ones
const generateNewMRRId = (existingRequests: MedicalRequest[]): string => {
  // Extract all MRR numbers
  const numbers = existingRequests
    .map(req => {
      const match = req.requestId.match(/MRR-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => num > 0);
  
  // Find the highest number
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  
  // Generate next number
  const nextNum = maxNum + 1;
  
  // Format with leading zeros (3 digits)
  return `MRR-${nextNum.toString().padStart(3, '0')}`;
};

const MedicalRecordsRequests = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMedicalRequests();
      const list = res?.data ?? res ?? [];
      
      if (Array.isArray(list) && list.length > 0) {
        const mappedRequests = list.map(mapApiRequest);
        
        // Ensure all requests have proper MRR IDs and no duplicates
        const seenIds = new Set();
        const finalRequests = mappedRequests.map(req => {
          let finalId = req.requestId;
          
          // If ID is duplicate or invalid, generate a new one
          if (seenIds.has(finalId) || !finalId.startsWith("MRR-")) {
            finalId = generateNewMRRId(mappedRequests);
          }
          seenIds.add(finalId);
          
          return { ...req, requestId: finalId };
        });
        
        setRequests(finalRequests);
      } else {
        // Use mock data with proper MRR IDs
        setRequests(mockRequests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(r => {
    const matchSearch =
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId.toLowerCase().includes(search.toLowerCase()) ||
      r.requestId.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const statusBadge = (s: string) => {
    const config: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
      received: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Received" },
    };
    const c = config[s] ?? config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
        <Icon className="h-3 w-3" />
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const counts = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    received: requests.filter(r => r.status === "received").length,
  };

  return (
    <AdminLayout title="Medical Records Requests">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-slate-800">{counts.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-burgundy" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Received Requests</p>
                <p className="text-2xl font-bold text-green-600">{counts.received}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Medical Records Requests</h3>
              <p className="text-sm text-slate-500 mt-1">Manage patient requests for medical records submitted via the website</p>
            </div>

            {/* Search Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, request ID or patient ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                />
              </div>
            </div>

            {/* Table Section */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-20" />
                    <div className="h-7 w-7 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No requests found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Request ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((request, index) => (
                      <tr
                        key={request.id}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                        onClick={() => navigate(`/medical-record/view/${request.id}`)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-semibold text-burgundy">{request.requestId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{request.patientName}</div>
                          <div className="text-xs text-slate-400">{request.patientId}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{formatDate(request.requestDate)}</td>
                       
                        <td className="py-3 px-4">
                          <div onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/medical-record/view/${request.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Show count of displayed requests */}
                {filtered.length > 0 && (
                  <div className="mt-4 text-xs text-slate-400 text-right">
                    Showing {filtered.length} of {requests.length} requests
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MedicalRecordsRequests;