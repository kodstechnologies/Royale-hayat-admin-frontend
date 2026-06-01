// Enquiries.tsx (List Page)
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Mail, X, Trash2, Building2 } from "lucide-react";
import { deleteEnquiry, getAllEnquiries } from "@/api/enquiries";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";
import AlertBox from "@/components/AlertBox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type ContactMessage = {
  id: string;
  enquiryId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  message: string;
  date: string;
  createdAt?: string;
};

const Enquiries = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<ContactMessage | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";
      const response = await getAllEnquiries({
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(effectiveSearch ? { search: effectiveSearch } : {}),
        ...(departmentFilter !== "all" ? { department: departmentFilter } : {}),
      });
      const list = response?.data?.data || [];
      const mapped: ContactMessage[] = (Array.isArray(list) ? list : []).map(
        (item: Record<string, unknown>, index: number) => ({
          id: String(item?._id ?? `ENQ-${index + 1}`),
          enquiryId: String(
            item?.enquiryId ?? `ENQ${String(index + 1).padStart(3, "0")}`,
          ),
          name: String(item?.name ?? "-"),
          email: String(item?.email ?? "-"),
          phone: item?.phone ? String(item.phone) : "-",
          department: String(item?.department ?? "-"),
          message: String(item?.message ?? "-"),
          date: item?.createdAt
            ? new Date(String(item.createdAt)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-",
          createdAt: item?.createdAt
            ? String(item.createdAt)
            : undefined,
        }),
      );
      setMessages(mapped);
      setTotalPages(response?.data?.meta?.totalPages || 1);
      setTotalRecords(response?.data?.meta?.totalRecords || 0);
      const uniqueDepartments = Array.from(
        new Set(mapped.map((item) => item.department).filter(Boolean)),
      );
      setDepartmentOptions((prev) =>
        Array.from(new Set([...prev, ...uniqueDepartments])),
      );
    } catch {
      setMessages([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, departmentFilter]);

  useEffect(() => {
    void fetchEnquiries();
  }, [fetchEnquiries]);

  const handleDeleteClick = (enquiry: ContactMessage) => {
    if (!hasPermission(PERMISSIONS.ENQUIRY_DELETE)) return;
    setEnquiryToDelete(enquiry);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete?.id || !hasPermission(PERMISSIONS.ENQUIRY_DELETE)) return;

    setIsDeleting(true);
    try {
      await deleteEnquiry(enquiryToDelete.id);
      toast.success("Enquiry deleted successfully");
      setDeleteOpen(false);
      setEnquiryToDelete(null);

      if (messages.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchEnquiries();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete enquiry");
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AdminLayout title="Enquiries">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Customer Enquiries</h3>
              <p className="text-sm text-slate-500 mt-1">View and manage enquiries from the contact form</p>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search by name, email or department..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setDepartmentFilter(e.target.value);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              >
                <option value="all">All Departments</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
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

            {/* Table Section */}
            {loading ? (
              <TableSkeletonLoader columns={7} rows={6} />
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <Mail className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No enquiries found</p>
                    <p className="text-sm text-slate-400 mt-1">Enquiries will appear here when customers contact you</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Enquiry ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Department</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messages.map((m, index) => (
                          <tr
                            key={m.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                            onClick={() => navigate(`/enquiries/view/${m.id}`)}
                          >
                            <td className="py-3 px-4">
                              <span className="font-mono text-xs font-semibold text-burgundy">{m.enquiryId}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-burgundy/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-burgundy">{getInitials(m.name)}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-800">{m.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-sm text-slate-600">{m.email}</td>
                            <td className="py-3 px-4 hidden lg:table-cell text-sm text-slate-600">{m.phone}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                                <Building2 className="h-3 w-3" />
                                {m.department}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-500">{m.date}</td>
                            <td className="py-3 px-4">
                              <div
                                className="inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => navigate(`/enquiries/view/${m.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                  title="View"
                                >
                                  <Eye
                                    size={14}
                                    className="text-slate-400 group-hover:text-burgundy transition-colors"
                                  />
                                </button>
                                <PermissionGate permission={PERMISSIONS.ENQUIRY_DELETE}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(m)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-700">{((currentPage - 1) * limit) + 1}</span> to{' '}
                        <span className="font-medium text-slate-700">{Math.min(currentPage * limit, totalRecords)}</span> of{' '}
                        <span className="font-medium text-slate-700">{totalRecords}</span> enquiries
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
          </div>
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${enquiryToDelete?.name}" (${enquiryToDelete?.enquiryId})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default Enquiries;