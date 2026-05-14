import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Search, Pencil, Trash2, ExternalLink, Plus, X, CheckCircle, XCircle } from "lucide-react";
import { deleteDoctor, getDoctors } from "@/api/doctors";
import { getDepartments } from "@/api/department";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import AlertBox from "@/components/AlertBox";

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
  const [search, setSearch] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ _id: string; name: string }>>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      console.error(error);
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

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoctor(doctorToDelete._id);
      if (doctors.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchDoctors();
      }
      setShowDeleteAlert(false);
      setDoctorToDelete(null);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsDeleting(false);
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
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Doctors Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage doctor profiles, specialties, and availability</p>
              </div>
              
              <Button
                onClick={() => navigate("/doctors/create")}
                className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create Doctor
              </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={search}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                />
              </div>
              <select
                value={selectedDepartmentId}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedDepartmentId(e.target.value);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {search && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-12">
                <Loader />
              </div>
            ) : (
              <>
                {/* Empty State */}
                {doctors.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">No doctors found</p>
                    <p className="text-sm text-slate-400 mt-1">Get started by creating your first doctor profile</p>
                    <Button
                      onClick={() => navigate("/doctors/create")}
                      className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Doctor
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Doctors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {doctors.map((doctor) => (
                        <div
                          key={doctor._id}
                          className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/10 flex items-center justify-center overflow-hidden border-2 border-burgundy/20">
                                  {doctor.image ? (
                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-burgundy font-bold text-xl">
                                      {doctor.name.split(" ").pop()?.[0] || doctor.name[0]}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-base font-semibold text-slate-800">{doctor.name}</p>
                                  <p className="text-xs text-slate-500">{doctor.specialty || "General"}</p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                                  doctor.isActive 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {doctor.isActive ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {doctor.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Department</span>
                                <span className="text-slate-700 font-medium">{getDepartmentName(doctor.department)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Title</span>
                                <span className="text-slate-700">{doctor.title || "-"}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Online Booking</span>
                                <span className={`font-medium ${doctor.availableOnline ? "text-green-600" : "text-slate-400"}`}>
                                  {doctor.availableOnline ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>

                            {doctor.expertise && doctor.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {doctor.expertise.slice(0, 3).map((exp) => (
                                  <span key={exp} className="px-2 py-0.5 rounded-full text-[10px] bg-burgundy/10 text-burgundy">
                                    {exp.length > 12 ? exp.slice(0, 10) + '...' : exp}
                                  </span>
                                ))}
                                {doctor.expertise.length > 3 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">
                                    +{doctor.expertise.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <ExternalLink size={12} />
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/doctors/edit/${doctor._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(doctor)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{((currentPage - 1) * limit) + 1}</span> to{' '}
                            <span className="font-medium text-slate-700">{Math.min(currentPage * limit, totalRecords)}</span> of{' '}
                            <span className="font-medium text-slate-700">{totalRecords}</span> doctors
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1 || loading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                              Previous
                            </button>
                            <div className="flex items-center gap-1">
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
                                        : "border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages || loading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Alert */}
      <AlertBox
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setDoctorToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        message={`Are you sure you want to delete "${doctorToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default Doctors;