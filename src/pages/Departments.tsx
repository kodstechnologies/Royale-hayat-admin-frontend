import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Pencil, Trash2, Image as ImageIcon, Plus, Search, X } from "lucide-react";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminDepartments, AdminDepartment } from "@/data/departments";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  order?: number;
};

// Convert AdminDepartment to Department format
const convertToDepartment = (dept: AdminDepartment): Department => {
  return {
    _id: dept.id,
    departmentId: dept.clinicalCode || dept.id,
    name: dept.name,
    nameAr: dept.nameAr,
    description: dept.description,
    descriptionAr: dept.descriptionAr,
    image: dept.image,
    category: dept.category,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
    isActive: true,
    order: 0,
  };
};

const initialDepartments: Department[] = adminDepartments.map(convertToDepartment);

// Function to load departments from localStorage and merge with initial departments
const loadDepartmentsFromStorage = () => {
  const stored = localStorage.getItem("rhh_departments");
  if (stored) {
    const storedDepts = JSON.parse(stored);
    // Convert stored departments to Department format
    const formattedStoredDepts = storedDepts.map((dept: any) => ({
      _id: dept._id,
      departmentId: dept.departmentId,
      name: dept.name,
      nameAr: dept.arabicName || dept.name,
      description: dept.description,
      descriptionAr: dept.arabicDescription || dept.description,
      image: dept.image,
      category: dept.catagoryId ? getCategoryNameFromId(dept.catagoryId) : "Clinical Speciality",
      createdAt: dept.createdAt || new Date().toISOString(),
      updatedAt: dept.updatedAt || new Date().toISOString(),
      isActive: dept.isActive !== undefined ? dept.isActive : true,
      order: dept.order || 0,
    }));
    
    // Merge stored departments with initial departments, avoiding duplicates by departmentId
    const existingDeptIds = new Set(formattedStoredDepts.map((dept: Department) => dept.departmentId));
    const newDeptsFromInitial = initialDepartments.filter(dept => !existingDeptIds.has(dept.departmentId));
    
    // Return stored departments first (newest first), then remaining initial departments
    return [...formattedStoredDepts, ...newDeptsFromInitial];
  }
  return initialDepartments;
};

// Helper function to get category name from ID
const getCategoryNameFromId = (categoryId: string): string => {
  const categoryMap: Record<string, string> = {
    cat1: "Cardiology",
    cat2: "Neurology",
    cat3: "Pediatrics",
    cat4: "Orthopedics",
    cat5: "Dermatology",
  };
  return categoryMap[categoryId] || "Clinical Speciality";
};

// Helper function to save user-created departments to localStorage
const saveUserDepartmentsToStorage = (allDepartments: Department[]) => {
  const initialDeptIds = new Set(initialDepartments.map(dept => dept.departmentId));
  const userCreatedDepts = allDepartments.filter(dept => !initialDeptIds.has(dept.departmentId));
  
  const deptsToStore = userCreatedDepts.map(dept => ({
    _id: dept._id,
    departmentId: dept.departmentId,
    name: dept.name,
    arabicName: dept.nameAr,
    description: dept.description,
    arabicDescription: dept.descriptionAr,
    image: dept.image,
    catagoryId: dept.category === "Clinical Speciality" ? "cat1" : "cat2",
    isActive: dept.isActive,
    order: dept.order,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
  }));
  localStorage.setItem("rhh_departments", JSON.stringify(deptsToStore));
};

const Departments = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories from departments
  const categories = Array.from(new Set(departments.map(dept => dept.category)));

  // Load departments on mount and listen for updates
  useEffect(() => {
    const mergedDepartments = loadDepartmentsFromStorage();
    setDepartments(mergedDepartments);
    setTotalRecords(mergedDepartments.length);
    setTotalPages(Math.ceil(mergedDepartments.length / limit));
  }, []);

  // Listen for department updates from create/edit page
  useEffect(() => {
    const handleDepartmentsUpdate = () => {
      const updatedDepartments = loadDepartmentsFromStorage();
      setDepartments(updatedDepartments);
      setTotalRecords(updatedDepartments.length);
      setTotalPages(Math.ceil(updatedDepartments.length / limit));
      if (currentPage > Math.ceil(updatedDepartments.length / limit)) {
        setCurrentPage(1);
      }
    };
    
    window.addEventListener("departmentsUpdated", handleDepartmentsUpdate);
    
    return () => {
      window.removeEventListener("departmentsUpdated", handleDepartmentsUpdate);
    };
  }, [currentPage, limit]);

  // Filter departments based on search and category
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = search === "" || 
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      dept.departmentId.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || dept.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * limit, currentPage * limit);
  const totalFilteredPages = Math.ceil(filteredDepartments.length / limit);

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    setTotalRecords(filteredDepartments.length);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredDepartments.length, totalFilteredPages, currentPage]);

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      const initialDeptIds = new Set(initialDepartments.map(dept => dept.departmentId));
      const isUserCreated = !initialDeptIds.has(departmentToDelete.departmentId);
      
      let updatedDepartments;
      if (isUserCreated) {
        // Remove user-created department completely
        updatedDepartments = departments.filter(dept => dept._id !== departmentToDelete._id);
      } else {
        // For initial departments, just mark as inactive
        updatedDepartments = departments.map(dept => 
          dept._id === departmentToDelete._id ? { ...dept, isActive: false } : dept
        );
      }
      
      setDepartments(updatedDepartments);
      saveUserDepartmentsToStorage(updatedDepartments);
      setTotalRecords(updatedDepartments.length);
      setTotalPages(Math.ceil(updatedDepartments.length / limit));
      
      if (currentPage > Math.ceil(updatedDepartments.length / limit) && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      window.dispatchEvent(new Event("departmentsUpdated"));
      
      setShowDeleteAlert(false);
      setDepartmentToDelete(null);
      setIsDeleting(false);
      toast.success("Department deleted successfully");
    }, 500);
  };

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Clinical Speciality":
        return "bg-blue-100 text-blue-700";
      case "Clinical Support Service":
        return "bg-green-100 text-green-700";
      case "Home Care Service":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout title="Departments">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Departments Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage hospital departments and their details</p>
              </div>
              
              {/* <Button
                onClick={() => navigate("/departments/create")}
                className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create Department
              </Button> */}
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search departments..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 h-10"
                  />
                </div>
                <Button variant="secondary" onClick={applySearch} size="sm">
                  Search
                </Button>
                {search && (
                  <Button variant="ghost" onClick={clearSearch} size="sm">
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-12">
                <Loader />
              </div>
            ) : (
              <>
                {/* Empty State */}
                {paginatedDepartments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No departments found</p>
                    <p className="text-sm text-slate-400 mt-1">Get started by creating your first department</p>
                    <Button
                      onClick={() => navigate("/departments/create")}
                      className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Department
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Departments Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {paginatedDepartments.map((dept) => (
                        <div
                          key={dept._id}
                          className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div
                            className="relative h-40 cursor-pointer overflow-hidden"
                            onClick={() => navigate(`/departments/view/${dept._id}`)}
                          >
                            {dept.image ? (
                              <img
                                src={dept.image}
                                alt={dept.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-burgundy/60 to-burgundy/30 flex items-center justify-center">
                                <ImageIcon size={48} className="text-white/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs text-white/80 font-mono">{dept.departmentId}</p>
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {dept.name}
                              </h3>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(dept.category)}`}>
                                {dept.category === "Clinical Speciality" ? "Clinical" : 
                                 dept.category === "Clinical Support Service" ? "Support" : "Home Care"}
                              </span>
                            </div>
                            {dept.isActive === false && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-900/80 text-white text-[10px] font-medium">
                                Inactive
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {dept.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/departments/view/${dept._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              {/* <button
                                type="button"
                                onClick={() => navigate(`/departments/edit/${dept._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(dept)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination - Bottom Right */}
                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex justify-end">
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
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                                      currentPage === pageNum
                                        ? "bg-burgundy text-white border-burgundy shadow-sm"
                                        : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
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
          setDepartmentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default Departments;