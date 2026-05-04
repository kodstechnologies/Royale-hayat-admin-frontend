import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Search, Pencil, Trash2, ExternalLink } from "lucide-react";
import { deleteDoctor, getDoctors } from "@/api/doctors";
import { getDepartments } from "@/api/department";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/SkeletonLoader";

type Doctor = {
  _id: string;
  doctorId?: string;
  name: string;
  specialty: string;
  department: string | { _id?: string; name?: string };
  title: string;
  bio: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
};

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ _id: string; name: string }>>([]);
  const navigate = useNavigate();

  const getDepartmentName = (department: Doctor["department"]) => {
    if (typeof department !== "string") return department?.name || "-";
    return departmentMap[department] || department || "-";
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getDoctors({
        page: currentPage,
        limit,
        ...(selectedDepartmentId === "all" ? {} : { department: selectedDepartmentId }),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setDoctors(response?.data?.data || []);
      setTotalPages(response?.data?.meta?.totalPages || 1);
      setTotalRecords(response?.data?.meta?.totalRecords || 0);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, limit, selectedDepartmentId, search]);

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
        setDepartmentOptions(
          departments
            .filter((dept: any) => dept?._id && dept?.name)
            .map((dept: any) => ({ _id: dept._id, name: dept.name }))
        );
        setDepartmentMap(nextMap);
      } catch {
        // Keep fallback to raw ID if lookup fails.
      }
    };
    fetchDepartmentMap();
  }, []);

  const handleDelete = async (doctor: Doctor) => {
    const ok = window.confirm(`Delete ${doctor.name}?`);
    if (!ok) return;

    setMessage("");
    try {
      await deleteDoctor(doctor._id);
      setMessage("Doctor deleted successfully.");
      if (doctors.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchDoctors();
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete doctor.");
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: Array<number | string> = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pageNumbers;
  };

  return (
    <AdminLayout title="Doctors">
     

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate("/doctors/create")}
          className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
        >
          + Create Doctor
        </button>
        <div className="flex items-center gap-3">
          <div className="relative w-full min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <select
            value={selectedDepartmentId}
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedDepartmentId(e.target.value);
            }}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-card rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center overflow-hidden">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-burgundy font-serif font-bold text-lg">{doctor.name.split(" ").pop()?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-sans font-semibold text-foreground">{doctor.name}</p>
                    <p className="text-xs font-sans text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[11px] ${
                    doctor.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  }`}
                >
                  {doctor.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="text-foreground">{getDepartmentName(doctor.department)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="text-foreground">{doctor.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online</span>
                  <span className="text-foreground">{doctor.availableOnline ? "Yes" : "No"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-xs"
                >
                  <ExternalLink size={14} />
                  View
                </button>
                <button
                  onClick={() => navigate(`/doctors/edit/${doctor._id}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-xs"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-error text-error text-xs"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="sticky bottom-0 z-20 mt-6 -mx-2 px-2 py-3 bg-background/95 backdrop-blur border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                type="button"
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..." || loading}
                className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                  currentPage === page
                    ? "bg-burgundy text-white border-burgundy shadow-sm"
                    : page === "..."
                    ? "border-transparent cursor-default"
                    : "border-border hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {message && <p className="text-xs text-muted-foreground mt-3">{message}</p>}
    </AdminLayout>
  );
};

export default Doctors;
