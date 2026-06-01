import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Shield, X, Loader2 } from "lucide-react";
import {
  getAllAlSafwaEnrollments,
  getAlSafwaEnrollmentById,
  type AlSafwaEnrollment,
} from "@/api/alSafwa";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";
import { toast } from "sonner";

type EnrollmentRow = AlSafwaEnrollment & {
  id: string;
  date: string;
};

const AlSafwaEnrollments = () => {
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "viewed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [selected, setSelected] = useState<EnrollmentRow | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveSearch =
        debouncedSearch.length >= 2 ? debouncedSearch : undefined;
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (effectiveSearch) params.search = effectiveSearch;
      if (filter === "new") params.isViewed = false;
      if (filter === "viewed") params.isViewed = true;

      const response = await getAllAlSafwaEnrollments(params);
      const list = response?.data?.data || [];
      const mapped: EnrollmentRow[] = (Array.isArray(list) ? list : []).map(
        (item: AlSafwaEnrollment) => ({
          ...item,
          id: String(item._id),
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-",
        })
      );
      setEnrollments(mapped);
      setTotalPages(response?.data?.meta?.totalPages || 1);
      setUnviewedCount(response?.data?.meta?.unviewedCount ?? 0);
    } catch {
      setEnrollments([]);
      setTotalPages(1);
      toast.error("Failed to load Al Safwa enrollments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, filter]);

  useEffect(() => {
    void fetchEnrollments();
  }, [fetchEnrollments]);

  const openDetail = async (row: EnrollmentRow) => {
    setSelected(row);
    setDetailLoading(true);
    try {
      const response = await getAlSafwaEnrollmentById(row.id);
      const data = response?.data?.data;
      if (data) {
        setSelected({
          ...data,
          id: String(data._id),
          date: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-",
        });
        setEnrollments((prev) =>
          prev.map((e) =>
            e.id === row.id ? { ...e, isViewed: true } : e
          )
        );
        if (!row.isViewed) {
          setUnviewedCount((c) => Math.max(0, c - 1));
        }
        window.dispatchEvent(new Event("alSafwaUpdated"));
      }
    } catch {
      toast.error("Failed to load enrollment details");
    } finally {
      setDetailLoading(false);
    }
  };

  const viewedBadge = (isViewed?: boolean) =>
    isViewed ? (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
        {t("Viewed")}
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
        {t("New")}
      </span>
    );

  return (
    <AdminLayout title="Al Safwa Enrollments">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  {t("Al Safwa Enrollments")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t(
                    "Manage enrollment applications for the Al Safwa Healthcare Program submitted via the website."
                  )}
                </p>
              </div>
              {unviewedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-burgundy/10 text-burgundy">
                  {unviewedCount} {t("new")}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t("Search by name, email, or phone...")}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
              {(["all", "new", "viewed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    filter === f
                      ? "bg-burgundy text-white border-burgundy"
                      : "border-slate-200 text-slate-600 hover:border-burgundy"
                  }`}
                >
                  {t(
                    f === "all"
                      ? "All"
                      : f === "new"
                        ? "New"
                        : "Viewed"
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <TableSkeletonLoader columns={7} rows={6} />
            ) : enrollments.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Shield className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">{t("No enrollments found")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                    <tr>
                      <th className="text-left px-4 py-2.5">{t("Applicant")}</th>
                      <th className="text-left px-4 py-2.5">{t("Phone")}</th>
                      <th className="text-left px-4 py-2.5">{t("Age")}</th>
                      <th className="text-left px-4 py-2.5">{t("Gender")}</th>
                      <th className="text-left px-4 py-2.5">{t("Date")}</th>
                      <th className="text-left px-4 py-2.5">{t("Status")}</th>
                      <th className="text-right px-4 py-2.5">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-t border-slate-100 hover:bg-slate-50/80 ${
                          !e.isViewed ? "bg-burgundy/[0.02]" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-800">{e.name}</div>
                          <div className="text-[10px] text-slate-500">{e.email}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{e.phone}</td>
                        <td className="px-4 py-2.5">{e.age}</td>
                        <td className="px-4 py-2.5">{e.gender}</td>
                        <td className="px-4 py-2.5 text-slate-500">{e.date}</td>
                        <td className="px-4 py-2.5">{viewedBadge(e.isViewed)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => void openDetail(e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10"
                            aria-label={t("View")}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  {t("Previous")}
                </button>
                <span className="px-3 py-1.5 text-xs text-slate-600">
                  {t("Page")} {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  {t("Next")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="h-5 w-5 text-burgundy shrink-0" />
                <h3 className="font-semibold text-slate-800 truncate">
                  {t("Al Safwa Enrollment")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label={t("Close")}
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="text-slate-500">{t("Name")}:</span>{" "}
                    <span className="font-medium">{selected.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("Email")}:</span>{" "}
                    <span className="font-medium break-all">{selected.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("Phone")}:</span>{" "}
                    <span className="font-medium">{selected.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("Age")}:</span>{" "}
                    <span className="font-medium">{selected.age}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("Gender")}:</span>{" "}
                    <span className="font-medium">{selected.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("Date")}:</span>{" "}
                    <span className="font-medium">{selected.date}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">{t("Status")}:</span>{" "}
                    {viewedBadge(selected.isViewed)}
                  </div>
                </div>
                <div className="text-sm rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-500 block mb-1">{t("Notes")}</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              </>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AlSafwaEnrollments;
