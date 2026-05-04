import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { getDoctorById } from "@/api/doctors";
import { getDepartments } from "@/api/department";
import { 
  ChevronLeft, 
  User, 
  XCircle, 
  Stethoscope, 
  Hospital, 
  Globe, 
  Award, 
  Brain, 
  Languages, 
  GraduationCap,
  Activity,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  BadgeCheck,
  Star,
  Heart
} from "lucide-react";

type DoctorViewData = {
  doctorId?: string;
  name?: string;
  specialty?: string;
  department?: string | { _id?: string; name?: string };
  title?: string;
  bio?: string;
  qualifications?: string[];
  expertise?: string[];
  languages?: string[];
  initials?: string;
  availableOnline?: boolean;
  image?: string;
  isActive?: boolean;
  email?: string;
  phone?: string;
  experience?: number;
  consultationFee?: number;
  availableDays?: string[];
  availableTime?: string;
  rating?: number;
  totalPatients?: number;
};

const ViewDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});

  const getDepartmentName = (department: DoctorViewData["department"]) => {
    if (!department) return "-";
    if (typeof department !== "string") return department.name || "-";
    return departmentMap[department] || department;
  };

  useEffect(() => {
    if (!id) return;
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getDoctorById(id);
        setDoctor(response?.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch doctor.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchDepartmentMap = async () => {
      try {
        const response = await getDepartments({ limit: 200 });
        const departments = response?.data?.data || [];
        const nextMap: Record<string, string> = {};
        departments.forEach((dept: any) => {
          if (dept?._id && dept?.name) {
            nextMap[dept._id] = dept.name;
          }
        });
        setDepartmentMap(nextMap);
      } catch {
        // Keep fallback to raw ID if lookup fails.
      }
    };
    fetchDepartmentMap();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="View Doctor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading doctor details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="View Doctor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!doctor) {
    return (
      <AdminLayout title="View Doctor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">Doctor not found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Doctor">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button 
          type="button" 
          onClick={() => navigate("/doctors")} 
          className="flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy-deep mb-6 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Column - Profile Card */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm sticky top-6 h-fit">
            {/* Profile Image */}
            <div className="relative p-6">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden">
                  {doctor.image ? (
                    <img 
                      src={doctor.image} 
                      alt={doctor.name || "Doctor"} 
                      className="w-full h-96 object-contain"
                    />
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-burgundy/10 flex items-center justify-center">
                        <User size={56} className="text-burgundy/60" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg ${
                  doctor.isActive 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-500 text-white"
                }`}>
                  {doctor.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="text-center mt-4">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                  {doctor.name || "-"}
                </h2>
                <p className="text-sm text-muted-foreground">{doctor.title || "Medical Professional"}</p>
                
                {/* Rating */}
                {(doctor.rating || doctor.totalPatients) && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {doctor.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                    )}
                    {doctor.totalPatients && (
                      <div className="text-xs text-muted-foreground">
                        {doctor.totalPatients}+ patients
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Doctor ID</span>
                  <span className="font-mono text-xs">{doctor.doctorId || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{getDepartmentName(doctor.department)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Specialty</span>
                  <span className="font-medium">{doctor.specialty || "-"}</span>
                </div>
                {doctor.experience && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{doctor.experience} years</span>
                  </div>
                )}
                {doctor.consultationFee && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span className="font-medium text-burgundy">${doctor.consultationFee}</span>
                  </div>
                )}
              </div>

              {/* Online Status */}
              <div className="mt-4 pt-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  doctor.availableOnline 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <Globe size={12} />
                  {doctor.availableOnline ? "Available for Online Consultation" : "In-person Consultation Only"}
                </div>
              </div>

              {/* Languages */}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages size={14} className="text-burgundy" />
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Languages Spoken
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages.map((lang) => (
                      <span key={lang} className="px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Bio Section */}
            {doctor.bio && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={18} className="text-burgundy" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">About</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {doctor.bio}
                </p>
              </div>
            )}

            {/* Qualifications */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={18} className="text-burgundy" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">Qualifications</h3>
                </div>
                <div className="space-y-3">
                  {doctor.qualifications.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <BadgeCheck size={16} className="text-burgundy mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise */}
            {doctor.expertise && doctor.expertise.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-burgundy" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">Experience</h3>
                </div>
                <ul className="list-disc list-outside pl-5 space-y-2 marker:text-burgundy">
                  {doctor.expertise.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Availability */}
            {(doctor.availableDays || doctor.availableTime) && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-burgundy" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">Availability</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.availableDays && doctor.availableDays.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Consultation Days</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availableDays.map((day, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {doctor.availableTime && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Consultation Hours</p>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 w-fit">
                        <Clock size={14} />
                        <span className="text-sm font-medium">{doctor.availableTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(doctor.email || doctor.phone) && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Mail size={18} className="text-burgundy" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">Contact Information</h3>
                </div>
                <div className="space-y-3">
                  {doctor.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Mail size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{doctor.email}</p>
                      </div>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Phone size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{doctor.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => navigate(`/doctors/edit/${id}`)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-burgundy text-white text-sm font-medium hover:bg-burgundy/90 transition-all shadow-sm"
              >
                Edit Doctor
              </button>
              <button 
                onClick={() => navigate("/doctors")}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-all"
              >
                View All Doctors
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewDoctor;