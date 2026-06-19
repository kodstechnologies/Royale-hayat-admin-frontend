import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  Search,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getDoctors,
  getFeaturedDoctorIds,
  syncFeaturedDoctors,
  mapApiDoctorToListItem,
  type ApiDoctor,
  type DoctorListItem,
} from "@/api/doctors";
import { getDepartments, mapApiDepartmentToListItem } from "@/api/department";
import { matchesDoctorSearch } from "@/lib/doctorSearch";

const Doctors = () => {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ _id: string; name: string }>>([]);

  const [isFeatureMode, setIsFeatureMode] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<Set<string>>(new Set());
  const [savingFeatured, setSavingFeatured] = useState(false);

  const navigate = useNavigate();

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await getDepartments({ page: 1, limit: 100, sortBy: "order", sortOrder: "asc" });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setDepartmentOptions(
        list.map((row) => {
          const mapped = mapApiDepartmentToListItem(row);
          return { _id: mapped._id, name: mapped.name };
        }),
      );
    } catch {
      setDepartmentOptions([]);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      };
      if (selectedDepartmentId !== "all") {
        params.department = selectedDepartmentId;
      }

      const [doctorsRes, featuredIds] = await Promise.all([
        getDoctors(params),
        getFeaturedDoctorIds(),
      ]);

      const list = Array.isArray(doctorsRes.data?.data)
        ? (doctorsRes.data.data as ApiDoctor[])
        : [];

      const mapped = list.map((row) => mapApiDoctorToListItem(row, featuredIds));
      const filtered =
        search.trim().length >= 2
          ? mapped.filter((doctor) => matchesDoctorSearch(doctor, search))
          : mapped;

      setDoctors(filtered);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDepartmentId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const totalPages = Math.max(1, Math.ceil(doctors.length / limit));
  const paginatedDoctors = doctors.slice((currentPage - 1) * limit, currentPage * limit);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getDepartmentName = (department: DoctorListItem["department"]) => {
    if (typeof department !== "string") {
      return department?.name || department?.arabicName || "-";
    }
    const match = departmentOptions.find((d) => d._id === department);
    return match?.name || department || "-";
  };

  const handleFeatureDoctorMode = () => {
    const alreadyFeatured = doctors.filter((d) => d.isFeatured).map((d) => d._id);
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

  const handleSaveFeaturedDoctors = async () => {
    setSavingFeatured(true);
    try {
      await syncFeaturedDoctors(Array.from(selectedDoctors));
      await fetchDoctors();
      toast.success(`${selectedDoctors.size} doctor(s) marked as featured`);
      setIsFeatureMode(false);
      setSelectedDoctors(new Set());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update featured doctors");
    } finally {
      setSavingFeatured(false);
    }
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
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage doctor profiles, specialties, and availability
                </p>
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
                      disabled={savingFeatured}
                      className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Save Featured ({selectedDoctors.size})
                    </Button>
                    <Button
                      onClick={cancelFeatureMode}
                      variant="outline"
                      disabled={savingFeatured}
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
                    Select doctors to feature on the homepage. Selected:{" "}
                    <strong>{selectedDoctors.size}</strong> doctor(s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoctors(new Set(doctors.map((d) => d._id)))}
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
                  placeholder="Search by name, initials (e.g. DAR), or specialty..."
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
            ) : paginatedDoctors.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium">No doctors found</p>
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
                        if (isFeatureMode) toggleDoctorSelection(doctor._id);
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/10 flex items-center justify-center overflow-hidden border-2 border-burgundy/20 relative">
                              {doctor.image ? (
                                <img
                                  src={doctor.image}
                                  alt={doctor.name}
                                  className="w-full h-full object-cover"
                                />
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
                              <p className="text-base font-semibold text-slate-800 break-words">
                                {doctor.name}
                              </p>
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
                              <div
                                className={`w-4 h-4 rounded border ${
                                  selectedDoctors.has(doctor._id)
                                    ? "bg-amber-500 border-amber-500"
                                    : "border-slate-300"
                                }`}
                              >
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
                            <span className="text-slate-700 font-medium text-right">
                              {getDepartmentName(doctor.department)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Title</span>
                            <span className="text-slate-700 text-right">
                              {doctor.title?.substring(0, 30) || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Online Booking</span>
                            <span
                              className={`font-medium ${doctor.availableOnline ? "text-green-600" : "text-slate-400"}`}
                            >
                              {doctor.availableOnline ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>

                        {!isFeatureMode && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/doctors/view/${doctor._id}`);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                            >
                              <ExternalLink size={12} />
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
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
                            className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs ${
                              currentPage === page
                                ? "bg-burgundy text-white border-burgundy"
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
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Doctors;
