import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createDepartment,
  deleteDepartment as deleteDepartmentApi,
  getDepartmentById,
  getDepartments,
  updateDepartment as updateDepartmentApi,
} from "@/api/department";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import CreateDepartment, { type CreateDepartmentFormData } from "./department/createDepartment";
import EditDepartmentModal, { type EditDepartmentFormData } from "./department/editDepartment";
import {
  appendDepartmentRichContentToFormData,
  richContentFromApi,
} from "./department/departmentFormShared";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  description: string;
  catagory?: string | { _id: string; name?: string };
  subspecialities?: (string | { _id: string; name?: string; description?: string })[];
  /** Derived first subspeciality (if API includes it) */
  subspeciality?: string | { _id: string; name?: string; description?: string };
  image?: string;
  subSpecialties?: string[];
  customExplainantions?: { _id?: string; subHeading?: string; explaination?: string[] }[];
  isActive?: boolean;
  order?: number;
};

const getCatagoryIdFromDepartment = (dept: Department | null): string => {
  if (!dept?.catagory) return "";
  const c = dept.catagory;
  if (typeof c === "string") return c;
  if (typeof c === "object" && c && "_id" in c) return String(c._id);
  return "";
};

const getSubspecialityIdsFromDepartment = (dept: Department | null): string[] => {
  if (!dept?.subspecialities?.length) {
    if (!dept?.subspeciality) return [];
    const s = dept.subspeciality;
    if (typeof s === "string") return [s];
    if (typeof s === "object" && s && "_id" in s) return [String(s._id)];
    return [];
  }
  return dept.subspecialities.map((item) =>
    typeof item === "string" ? item : String(item._id),
  );
};

const Departments = () => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const showSuccessToast = (text: string) => {
    toast.success(text, {
      position: "top-right",
      style: {
        background: "#16a34a",
        color: "#ffffff",
        border: "1px solid #15803d",
      },
    });
  };

  const showErrorToast = (text: string) => {
    toast.error(text, { position: "top-right" });
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments({
        page: currentPage,
        limit,
        sortBy: "order",
        sortOrder: "asc",
        ...(activeFilter === "all" ? {} : { isActive: activeFilter === "active" }),
      });
      setDepartments(response?.data?.data || []);
      setTotalPages(response?.data?.meta?.pages || 1);
      setTotalRecords(response?.data?.meta?.total || 0);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch departments.";
      setMessage(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, limit, activeFilter]);

  const handleCreateDepartment = async (formData: CreateDepartmentFormData) => {
    setMessage("");
    setSaving(true);
    try {
      const departmentId = formData.departmentId.trim();
      const normalizedName = formData.name.trim();
      const normalizedDescription = formData.description.trim();
      if (!departmentId || !normalizedName || normalizedDescription.length < 10) {
        const validationMessage = "Please provide Department ID, Name, and Description (min 10 characters).";
        setMessage(validationMessage);
        showErrorToast(validationMessage);
        return;
      }

      if (!formData.catagoryId?.trim()) {
        const validationMessage = "Please select a category.";
        setMessage(validationMessage);
        showErrorToast(validationMessage);
        return;
      }

      const formPayload = new FormData();
      formPayload.append("departmentId", departmentId);
      formPayload.append("name", normalizedName);
      formPayload.append("description", normalizedDescription);
      formPayload.append("isActive", String(formData.isActive));
      formPayload.append("order", String(Number(formData.order || 0)));
      formPayload.append("catagory", formData.catagoryId.trim());
      formPayload.append("subspecialities", JSON.stringify(formData.subspecialityIds));

      appendDepartmentRichContentToFormData(formPayload, {
        customExplainantions: formData.customExplainantions,
      });

      if (formData.imageFile) {
        formPayload.append("image", formData.imageFile);
      }

      await createDepartment(formPayload);
      setMessage("Department created successfully.");
      showSuccessToast("Department created successfully.");
      
      setCurrentPage(1);
      await fetchDepartments();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to create department.";
      setMessage(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const openDepartment = async (id: string) => {
    setMessage("");
    try {
      const response = await getDepartmentById(id);
      setSelectedDept(response?.data?.data || null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch department.";
      setMessage(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const updateDepartment = async (values: EditDepartmentFormData) => {
    if (!selectedDept) return;
    setSaving(true);
    setMessage("");
    try {
      const departmentId = values.departmentId?.trim();
      const name = values.name?.trim();
      const description = values.description?.trim();

      if (!departmentId || !name || !description || description.length < 10) {
        const validationMessage = "Please provide Department ID, Name, and Description (min 10 characters).";
        setMessage(validationMessage);
        showErrorToast(validationMessage);
        return;
      }

      if (!values.catagoryId?.trim()) {
        const validationMessage = "Please select a category.";
        setMessage(validationMessage);
        showErrorToast(validationMessage);
        return;
      }

      const formPayload = new FormData();
      formPayload.append("departmentId", departmentId);
      formPayload.append("name", name);
      formPayload.append("description", description);
      formPayload.append("isActive", String(Boolean(values.isActive)));
      formPayload.append("order", String(values.order || 0));
      formPayload.append("catagory", values.catagoryId.trim());
      formPayload.append("subspecialities", JSON.stringify(values.subspecialityIds));

      appendDepartmentRichContentToFormData(formPayload, {
        customExplainantions: values.customExplainantions,
      });

      if (values.imageFile) {
        formPayload.append("image", values.imageFile);
      }

      const response = await updateDepartmentApi(selectedDept._id, formPayload);
      const updated = response?.data?.data || selectedDept;
      setSelectedDept(updated);
      closeEditModal();
      setMessage("Department updated successfully.");
      showSuccessToast("Department updated successfully.");
      await fetchDepartments();
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to update department.";
      setMessage(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDepartmentApi(departmentToDelete._id);
      setMessage("Department deleted successfully.");
      showSuccessToast("Department deleted successfully.");
      
      if (departments.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchDepartments();
      }
      
      setTimeout(() => setMessage(""), 3000);
      setShowDeleteAlert(false);
      setDepartmentToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to delete department.";
      setMessage(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const closeEditModal = () => {
    setSelectedDept(null);
  };

  return (
    <AdminLayout title="Departments">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <CreateDepartment saving={saving} onSubmit={handleCreateDepartment} />

        <div>
          <select
            value={activeFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setActiveFilter(e.target.value as "all" | "active" | "inactive");
            }}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          >
            <option value="all">All Departments</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {departments.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No departments found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {departments.map((dept) => (
                  <div
                    key={dept._id}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div 
                      className="relative h-40 cursor-pointer overflow-hidden"
                      onClick={() => openDepartment(dept._id)}
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
                        <h3 className="font-serif font-semibold text-white text-lg leading-tight">
                          {dept.name}
                        </h3>
                      </div>
                      {dept.isActive === false && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gray-900/80 text-white text-[10px] font-medium">
                          Inactive
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {dept.description}
                      </p>
                      {dept.subSpecialties && dept.subSpecialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {dept.subSpecialties.slice(0, 2).map((specialty) => (
                            <span key={specialty} className="px-1.5 py-0.5 rounded text-[10px] bg-burgundy/10 text-burgundy">
                              {specialty.length > 15 ? specialty.slice(0, 12) + '...' : specialty}
                            </span>
                          ))}
                          {dept.subSpecialties.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                              +{dept.subSpecialties.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDepartment(dept._id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(dept)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
            </>
          )}
        </>
      )}

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

      <EditDepartmentModal
        isOpen={Boolean(selectedDept)}
        saving={saving}
        initialValues={{
          ...richContentFromApi(selectedDept as unknown as Record<string, unknown>),
          departmentId: selectedDept?.departmentId || "",
          name: selectedDept?.name || "",
          description: selectedDept?.description || "",
          catagoryId: getCatagoryIdFromDepartment(selectedDept),
          subspecialityIds: getSubspecialityIdsFromDepartment(selectedDept),
          imageFile: null,
          isActive: Boolean(selectedDept?.isActive),
          order: selectedDept?.order || 0,
        }}
        currentImageUrl={selectedDept?.image || ""}
        onClose={closeEditModal}
        onSubmit={updateDepartment}
      />
    </AdminLayout>
  );
};

export default Departments;