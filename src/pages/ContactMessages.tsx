import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Mail, X, Phone, User, Calendar, MessageSquare } from "lucide-react";
import { getAllEnquiries } from "@/api/enquiries";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";

type ContactMessage = {
  id: string;
  enquiryId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  message: string;
  date: string;
};

const ContactMessages = () => {
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
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchEnquiries = async () => {
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
        const mapped: ContactMessage[] = (Array.isArray(list) ? list : []).map((item: any, index: number) => ({
          id: item?._id || `ENQ-${index + 1}`,
          enquiryId: item?.enquiryId || `ENQ${String(index + 1).padStart(3, "0")}`,
          name: item?.name || "-",
          email: item?.email || "-",
          phone: item?.phone ? String(item.phone) : "-",
          department: item?.department || "-",
          message: item?.message || "-",
          date: item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-",
        }));
        setMessages(mapped);
        setTotalPages(response?.data?.meta?.totalPages || 1);
        setTotalRecords(response?.data?.meta?.totalRecords || 0);
        const uniqueDepartments = Array.from(new Set(mapped.map((item) => item.department).filter(Boolean)));
        setDepartmentOptions((prev) => Array.from(new Set([...prev, ...uniqueDepartments])));
      } catch {
        setMessages([]);
        setTotalPages(1);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, [currentPage, limit, debouncedSearch, departmentFilter]);

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
    <AdminLayout title="Contact Messages">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-muted-foreground mb-5">
          View and manage patient inquiries from the contact form
        </p>

        <div className="bg-card rounded-xl border border-border p-4 mb-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={search} 
              onChange={e => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }} 
              placeholder="Search by name, email or department..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setDepartmentFilter(e.target.value);
              }}
              className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>

        {/* Messages Table */}
        {loading ? (
          <TableSkeletonLoader columns={7} rows={6} />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enquiry ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Mail size={32} className="text-muted-foreground/30" />
                        <span className="text-sm text-muted-foreground">No enquiries found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr 
                      key={m.id} 
                      className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer group" 
                      onClick={() => setSelected(m)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-burgundy font-semibold">{m.enquiryId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-burgundy">{getInitials(m.name)}</span>
                          </div>
                          <span className="text-sm font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm">{m.email}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm">{m.phone}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-burgundy/5 text-burgundy">
                          {m.department}
                        </span>
                       </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{m.date}</td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Eye size={14} className="text-muted-foreground group-hover:text-burgundy transition-colors" />
                        </button>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
      </div>

      {/* Message Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-lg w-full animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <Mail size={18} className="text-burgundy" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground">{selected.department}</h3>
                  <p className="text-xs text-muted-foreground">Enquiry #{selected.enquiryId}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Name</p>
                    <p className="text-sm font-medium">{selected.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                    <p className="text-sm font-medium">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Phone</p>
                    <p className="text-sm font-medium">{selected.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                    <p className="text-sm font-medium">{selected.date}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="rounded-lg bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-burgundy" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Message</p>
                </div>
                <p className="text-sm leading-relaxed">{selected.message}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-5 border-t border-border">
              <button 
                onClick={() => setSelected(null)} 
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContactMessages;