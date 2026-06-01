import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  CheckCircle,
  FileText,
  AlertCircle,
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlertBox from "@/components/AlertBox";
import { toast } from "sonner";
import {
  getAllAchievements,
  deleteAchievement,
  updateAchievement,
} from "@/api/achievement";
import {
  type Achievement,
  mapApiToAchievement,
  buildAchievementFormData,
} from "@/data/achievementData";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

const StatsCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: typeof Award; color: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-full bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
    </div>
  </div>
);

const AllAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [makeAllDraftOpen, setMakeAllDraftOpen] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const navigate = useNavigate();

  const totalAchievements = achievements.length;
  const publishedCount = achievements.filter((a) => a.status === "published").length;
  const draftCount = achievements.filter((a) => a.status === "draft").length;
  const getAchievementId = (achievement: Achievement) =>
    achievement.id || (achievement as unknown as { _id?: string })._id || "";

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAchievements({ limit: 100 });
      const list = (res.data ?? []).map(mapApiToAchievement);
      setAchievements(list);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      search === "" ||
      achievement.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      achievement.arabicEmployeeName.toLowerCase().includes(search.toLowerCase()) ||
      achievement.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      achievement.title.toLowerCase().includes(search.toLowerCase()) ||
      achievement.arabicTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === "all" || achievement.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const paginatedAchievements = filteredAchievements.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const totalFilteredPages = Math.ceil(filteredAchievements.length / limit) || 1;

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredAchievements.length, totalFilteredPages, currentPage]);

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleDeleteClick = (achievement: Achievement) => {
    if (!hasPermission(PERMISSIONS.ACHIEVEMENT_DELETE)) return;
    setAchievementToDelete(achievement);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!achievementToDelete || !hasPermission(PERMISSIONS.ACHIEVEMENT_DELETE)) return;

    setIsDeleting(true);
    try {
      const achievementId = getAchievementId(achievementToDelete);
      if (!achievementId) {
        toast.error("Achievement ID is missing");
        return;
      }
      await deleteAchievement(achievementId);
      toast.success("Achievement deleted successfully");
      setDeleteOpen(false);
      setAchievementToDelete(null);
      await fetchAchievements();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete achievement");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateVisibility = async (achievement: Achievement, visibility: "show" | "hide") => {
    if (!hasPermission(PERMISSIONS.ACHIEVEMENT_UPDATE)) return;
    try {
      const achievementId = getAchievementId(achievement);
      if (!achievementId) {
        toast.error("Achievement ID is missing");
        return;
      }
      const formPayload = buildAchievementFormData({
        employeeId: achievement.employeeId || "temp",
        employeeName: achievement.employeeName || "temp",
        title: achievement.title || "temp",
        achievements: achievement.description || "temp",
        visibilityStatus: visibility,
      });
      formPayload.delete("employeeId");
      formPayload.delete("employeeName");
      formPayload.delete("title");
      formPayload.delete("achievements");
      formPayload.delete("employeeID");
      formPayload.delete("employeeNameArabic");
      formPayload.delete("department");
      formPayload.delete("arabicDepartment");
      formPayload.delete("arabicTitle");
      formPayload.delete("arabicAchievements");
      await updateAchievement(achievementId, formPayload);
      toast.success(visibility === "show" ? "Achievement published successfully" : "Achievement marked as draft");
      await fetchAchievements();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update achievement");
    }
  };

  const handleMarkAsDraft = (achievement: Achievement) => updateVisibility(achievement, "hide");

  const handleMarkAsPublished = (achievement: Achievement) => updateVisibility(achievement, "show");

  const handleMakeAllDraft = async () => {
    if (!hasPermission(PERMISSIONS.ACHIEVEMENT_UPDATE)) return;
    setIsUpdatingAll(true);
    try {
      const published = achievements.filter((a) => a.status === "published");
      await Promise.all(
        published.map((a) =>
          (() => {
            const achievementId = getAchievementId(a);
            const payload = buildAchievementFormData({
              employeeId: a.employeeId || "temp",
              employeeName: a.employeeName || "temp",
              title: a.title || "temp",
              achievements: a.description || "temp",
              visibilityStatus: "hide",
            });
            payload.delete("employeeId");
            payload.delete("employeeName");
            payload.delete("title");
            payload.delete("achievements");
            payload.delete("employeeID");
            payload.delete("employeeNameArabic");
            payload.delete("department");
            payload.delete("arabicDepartment");
            payload.delete("arabicTitle");
            payload.delete("arabicAchievements");
            return updateAchievement(achievementId, payload);
          })()
        )
      );
      toast.success("All achievements marked as draft");
      setMakeAllDraftOpen(false);
      await fetchAchievements();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update achievements");
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
            <AlertCircle className="h-3 w-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <AdminLayout title="Achievements">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Achievements">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-3 sm:gap-4">
          <StatsCard title="Total Achievements" value={totalAchievements} icon={Award} color="burgundy" />
          <StatsCard title="Published" value={publishedCount} icon={CheckCircle} color="emerald-500" />
          <StatsCard title="Draft" value={draftCount} icon={FileText} color="amber-500" />
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Employee Recognitions</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage employee achievements and recognitions</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_UPDATE}>
                  <Button
                    onClick={() => setMakeAllDraftOpen(true)}
                    variant="outline"
                    disabled={publishedCount === 0 || isUpdatingAll}
                    className="gap-2 w-full sm:w-auto border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                  >
                    <FileText className="h-4 w-4" />
                    Make All Draft
                  </Button>
                </PermissionGate>
                <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_CREATE}>
                  <Button
                    onClick={() => navigate("/achievements/create")}
                    className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Achievement
                  </Button>
                </PermissionGate>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by employee name, ID or title..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 h-10 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={applySearch} className="flex-1 sm:flex-none">
                    Search
                  </Button>
                  {search && (
                    <Button variant="ghost" onClick={clearSearch} className="flex-1 sm:flex-none">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {paginatedAchievements.length === 0 ? (
              <div className="text-center py-16">
                <Award className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No achievements found</p>
                <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_CREATE}>
                  <Button onClick={() => navigate("/achievements/create")} className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90">
                    <Plus className="h-4 w-4" />
                    Add Achievement
                  </Button>
                </PermissionGate>
              </div>
            ) : (
              <>
                
                <div className="md:hidden space-y-3">
                  {paginatedAchievements.map((achievement) => {
                    const achievementId = getAchievementId(achievement);
                    return (
                      <article
                        key={achievementId}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="font-mono text-xs font-semibold text-burgundy bg-burgundy/5 px-2 py-1 rounded break-all">
                            {achievement.employeeId}
                          </span>
                          {getStatusBadge(achievement.status)}
                        </div>
                        <div className="space-y-1 mb-3 min-w-0">
                          <p className="font-medium text-slate-800 text-sm leading-snug break-words">
                            {achievement.employeeName}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2 break-words">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(achievement.date)}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => navigate(`/achievements/view/${achievementId}`)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-burgundy bg-burgundy/10 hover:bg-burgundy/15"
                            title="View"
                            aria-label="View achievement"
                          >
                            <Eye size={16} />
                          </button>
                          <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_UPDATE}>
                            <button
                              type="button"
                              onClick={() => navigate(`/achievements/edit/${achievementId}`)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100"
                              title="Edit"
                              aria-label="Edit achievement"
                            >
                              <Pencil size={16} />
                            </button>
                            {achievement.status === "published" ? (
                              <button
                                type="button"
                                onClick={() => handleMarkAsDraft(achievement)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100"
                                title="Mark as Draft"
                                aria-label="Mark as draft"
                              >
                                <FileText size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPublished(achievement)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                title="Publish"
                                aria-label="Publish achievement"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </PermissionGate>
                          <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_DELETE}>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(achievement)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100"
                              title="Delete"
                              aria-label="Delete achievement"
                            >
                              <Trash2 size={16} />
                            </button>
                          </PermissionGate>
                        </div>
                      </article>
                    );
                  })}
                  {filteredAchievements.length > 0 && (
                    <p className="text-xs text-slate-400 text-center pt-1">
                      Showing {paginatedAchievements.length} of {filteredAchievements.length} achievements
                    </p>
                  )}
                </div>

                
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Employee ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Employee Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAchievements.map((achievement, index) => (
                        <tr
                          key={getAchievementId(achievement)}
                          className={`border-b border-slate-100 hover:bg-slate-50/80 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold text-burgundy bg-burgundy/5 px-2 py-1 rounded">
                              {achievement.employeeId}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{achievement.employeeName}</td>
                          <td className="py-3 px-4 text-slate-700 line-clamp-1">{achievement.title}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">{formatDate(achievement.date)}</td>
                          <td className="py-3 px-4">{getStatusBadge(achievement.status)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => navigate(`/achievements/view/${getAchievementId(achievement)}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10" title="View">
                                <Eye size={14} />
                              </button>
                              <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_UPDATE}>
                                <button onClick={() => navigate(`/achievements/edit/${getAchievementId(achievement)}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10" title="Edit">
                                  <Pencil size={14} />
                                </button>
                                {achievement.status === "published" ? (
                                  <button onClick={() => handleMarkAsDraft(achievement)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50" title="Mark as Draft">
                                    <FileText size={14} />
                                  </button>
                                ) : (
                                  <button onClick={() => handleMarkAsPublished(achievement)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50" title="Publish">
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                              </PermissionGate>
                              <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_DELETE}>
                                <button onClick={() => handleDeleteClick(achievement)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete">
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

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-wrap justify-center sm:justify-end items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-xs text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                    >
                      Next
                    </button>
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
          setAchievementToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${achievementToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />

      <AlertBox
        isOpen={makeAllDraftOpen}
        onClose={() => setMakeAllDraftOpen(false)}
        onConfirm={handleMakeAllDraft}
        title="Make All Draft"
        message="Mark all published achievements as draft (hidden on website)?"
        confirmText="Yes, Make All Draft"
        cancelText="Cancel"
        isDeleting={isUpdatingAll}
      />
    </AdminLayout>
  );
};

export default AllAchievements;
