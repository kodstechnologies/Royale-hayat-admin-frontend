import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Search, Pencil, Trash2, ExternalLink, Plus, X, CheckCircle, XCircle, Star, StarOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import AlertBox from "@/components/AlertBox";
import { adminDoctors, AdminDoctor } from "@/data/adminDoctors";
import { adminDepartments } from "@/data/departments";
import { toast } from "sonner";

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
  isFeatured?: boolean;
};

const getStoredFeaturedDoctors = (): string[] => {
  const stored = localStorage.getItem("rhh_featured_doctors");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const saveFeaturedDoctors = (featuredIds: string[]) => {
  localStorage.setItem("rhh_featured_doctors", JSON.stringify(featuredIds));
};

const convertToDoctor = (adminDoctor: AdminDoctor, index: number): Doctor => {
  return {
    _id: adminDoctor.id,
    doctorId: adminDoctor.doctorId,
    name: adminDoctor.name,
    specialty: adminDoctor.title?.split(",")[0] || "General",
    department: adminDoctor.department,
    title: adminDoctor.title,
    bio: "",
    qualifications: adminDoctor.qualifications,
    expertise: adminDoctor.expertise,
    languages: adminDoctor.languages,
    initials: adminDoctor.initials,
    color: "bg-burgundy",
    symptoms: [],
    availableOnline: adminDoctor.availableOnline,
    image: adminDoctor.image,
    isActive: true,
    isFeatured: false,
  };
};

const loadUserDoctors = () => {
  const stored = localStorage.getItem("rhh_doctors");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const convertUserDoctorToDoctor = (userDoctor: any): Doctor => {
  return {
    _id: userDoctor.id,
    doctorId: userDoctor.doctorId,
    name: userDoctor.name,
    specialty: userDoctor.title?.split(",")[0] || "General",
    department: userDoctor.department,
    title: userDoctor.title,
    bio: "",
    qualifications: userDoctor.qualifications || [],
    expertise: userDoctor.expertise || [],
    languages: userDoctor.languages || [],
    initials: userDoctor.initials || "DR",
    color: "bg-burgundy",
    symptoms: [],
    availableOnline: userDoctor.availableOnline !== undefined ? userDoctor.availableOnline : true,
    image: userDoctor.image,
    isActive: userDoctor.isActive !== undefined ? userDoctor.isActive : true,
    isFeatured: false,
  };
};

const getMergedDoctors = (): Doctor[] => {
  const userDoctors = loadUserDoctors();
  const convertedUserDoctors = userDoctors.map(convertUserDoctorToDoctor);
  const staticDoctors = adminDoctors.map((doctor, index) => convertToDoctor(doctor, index));
  
  const existingDoctorIds = new Set(convertedUserDoctors.map(doc => doc.doctorId));
  const newStaticDoctors = staticDoctors.filter(doc => !existingDoctorIds.has(doc.doctorId));
  
  return [...convertedUserDoctors, ...newStaticDoctors];
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
  
  const [isFeatureMode, setIsFeatureMode] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    const mergedDoctors = getMergedDoctors();
    const featuredIds = getStoredFeaturedDoctors();

    const doctorsWithFeatured = mergedDoctors.map((doctor) => ({
      ...doctor,
      isFeatured: featuredIds.includes(doctor._id),
    }));

    setDoctors(doctorsWithFeatured);
    setTotalRecords(doctorsWithFeatured.length);
    setTotalPages(Math.ceil(doctorsWithFeatured.length / limit));
  };

  useEffect(() => {
    const handleDoctorsUpdate = () => {
      loadDoctors();
      if (currentPage > Math.ceil(doctors.length / limit)) {
        setCurrentPage(1);
      }
    };
    
    window.addEventListener("doctorsUpdated", handleDoctorsUpdate);
    
    return () => {
      window.removeEventListener("doctorsUpdated", handleDoctorsUpdate);
    };
  }, [currentPage, limit, doctors.length]);

  useEffect(() => {
    const deptOptions = adminDepartments.map(dept => ({
      _id: dept.id,
      name: dept.name
    }));
    setDepartmentOptions(deptOptions);
    
    const deptMap: Record<string, string> = {};
    adminDepartments.forEach(dept => {
      deptMap[dept.id] = dept.name;
    });
    setDepartmentMap(deptMap);
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = search === "" || 
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      (doctor.specialty && doctor.specialty.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.title && doctor.title.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDepartment = selectedDepartmentId === "all" || 
      (typeof doctor.department === "string" && doctor.department === selectedDepartmentId);
    
    return matchesSearch && matchesDepartment;
  });

  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * limit, currentPage * limit);
  const totalFilteredPages = Math.ceil(filteredDoctors.length / limit);

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    setTotalRecords(filteredDoctors.length);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredDoctors.length, totalFilteredPages, currentPage]);

  const getDepartmentName = (department: Doctor["department"]) => {
    if (typeof department !== "string") return department?.name || "-";
    return departmentMap[department] || department || "-";
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      const userDoctors = loadUserDoctors();
      const isUserCreated = userDoctors.some((doc: any) => doc.id === doctorToDelete._id);
      
      let updatedDoctors;
      if (isUserCreated) {
        const updatedUserDoctors = userDoctors.filter((doc: any) => doc.id !== doctorToDelete._id);
        localStorage.setItem("rhh_doctors", JSON.stringify(updatedUserDoctors));
        updatedDoctors = doctors.filter(doc => doc._id !== doctorToDelete._id);
      } else {
        updatedDoctors = doctors.filter(doc => doc._id !== doctorToDelete._id);
      }
      
      const featuredIds = getStoredFeaturedDoctors();
      const updatedFeatured = featuredIds.filter((id) => id !== doctorToDelete._id);
      saveFeaturedDoctors(updatedFeatured);

      setDoctors(updatedDoctors);

      window.dispatchEvent(new Event("doctorsUpdated"));
      
      const newTotalPages = Math.ceil(updatedDoctors.length / limit);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      toast.success("Doctor deleted successfully");
      setShowDeleteAlert(false);
      setDoctorToDelete(null);
      setIsDeleting(false);
    }, 500);
  };

  const handleFeatureDoctorMode = () => {
    const alreadyFeatured = doctors.filter((doctor) => doctor.isFeatured).map((doctor) => doctor._id);
    setSelectedDoctors(new Set(alreadyFeatured));
    setIsFeatureMode(true);
  };

  const toggleDoctorSelection = (doctorId: string) => {
    const newSelection = new Set(selectedDoctors);
    if (newSelection.has(doctorId)) {
      newSelection.delete(doctorId);
    } else {
      newSelection.add(doctorId);
    }
    setSelectedDoctors(newSelection);
  };

  const handleSaveFeaturedDoctors = () => {
    const featuredIds = Array.from(selectedDoctors);
    saveFeaturedDoctors(featuredIds);

    const updatedDoctors = doctors.map((doctor) => ({
      ...doctor,
      isFeatured: featuredIds.includes(doctor._id),
    }));
    setDoctors(updatedDoctors);

    toast.success(`${featuredIds.length} doctor(s) marked as featured`);
    setIsFeatureMode(false);
    setSelectedDoctors(new Set());
    window.dispatchEvent(new Event("doctorsUpdated"));
  };

  const cancelFeatureMode = () => {
    setIsFeatureMode(false);
    setSelectedDoctors(new Set());
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
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-4 sm:p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Doctors Management</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage doctor profiles, specialties, and availability</p>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                {!isFeatureMode ? (
                  <>
                    <Button
                      onClick={handleFeatureDoctorMode}
                      className="gap-2 w-full sm:w-auto bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Star className="h-4 w-4" />
                      Feature Doctors
                    </Button>
                    <Button
                      onClick={() => navigate("/featured-doctors")}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Star className="h-4 w-4" />
                      View Featured
                    </Button>
                    <Button
                      onClick={() => navigate("/doctors/create")}
                      className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Create Doctor
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveFeaturedDoctors}
                      className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Save Featured ({selectedDoctors.size})
                    </Button>
                    <Button
                      onClick={cancelFeatureMode}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            
            {isFeatureMode && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Star className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-amber-800">
                    Select doctors to feature on the homepage. Selected: <strong>{selectedDoctors.size}</strong> doctor(s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoctors(new Set(doctors.map(d => d._id)))}
                  className="text-xs text-amber-600 hover:text-amber-800 underline shrink-0 self-start sm:self-center"
                >
                  Select All
                </button>
              </div>
            )}

            
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div className="relative w-full sm:flex-1 sm:max-w-md">
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
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
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
                  className="text-slate-500 hover:text-slate-700 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            
            {loading ? (
              <div className="py-12">
                <Loader />
              </div>
            ) : (
              <>
                
                {paginatedDoctors.length === 0 ? (
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {paginatedDoctors.map((doctor) => (
                        <div
                          key={doctor._id}
                          className={`group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
                            isFeatureMode && selectedDoctors.has(doctor._id)
                              ? "border-amber-400 ring-2 ring-amber-400"
                              : "border-slate-200"
                          }`}
                          onClick={() => {
                            if (isFeatureMode) {
                              toggleDoctorSelection(doctor._id);
                            }
                          }}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/10 flex items-center justify-center overflow-hidden border-2 border-burgundy/20 relative">
                                  {doctor.image ? (
                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-burgundy font-bold text-xl">
                                      {doctor.name.split(" ").pop()?.[0] || doctor.name[0]}
                                    </span>
                                  )}
                                  {doctor.isFeatured && !isFeatureMode && (
                                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                                      <Star className="h-3 w-3 text-white fill-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-slate-800 break-words">{doctor.name}</p>
                                  <p className="text-xs text-slate-500">{doctor.specialty || "General"}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
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
                                {isFeatureMode && (
                                  <div className={`w-4 h-4 rounded border ${
                                    selectedDoctors.has(doctor._id)
                                      ? "bg-amber-500 border-amber-500"
                                      : "border-slate-300"
                                  }`}>
                                    {selectedDoctors.has(doctor._id) && (
                                      <CheckCircle className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Department</span>
                                <span className="text-slate-700 font-medium text-right">{getDepartmentName(doctor.department)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Title</span>
                                <span className="text-slate-700 text-right">{doctor.title?.substring(0, 30) || "-"}</span>
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
                                    {exp.length > 15 ? exp.slice(0, 12) + '...' : exp}
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    
                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center sm:justify-end">
                          <div className="flex flex-wrap justify-center gap-2">
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