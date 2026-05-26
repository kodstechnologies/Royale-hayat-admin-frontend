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

const StatsCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: typeof Award; color: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
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
      achievement.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      achievement.title.toLowerCase().includes(search.toLowerCase());

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
    setAchievementToDelete(achievement);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!achievementToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAchievement(achievementToDelete.id);
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
    try {
      const formPayload = buildAchievementFormData({
        employeeId: achievement.employeeId,
        employeeName: achievement.employeeName,
        department: achievement.department,
        title: achievement.title,
        achievements: achievement.description,
        visibilityStatus: visibility,
      });
      await updateAchievement(achievement.id, formPayload);
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
    setIsUpdatingAll(true);
    try {
      const published = achievements.filter((a) => a.status === "published");
      await Promise.all(
        published.map((a) =>
          updateAchievement(
            a.id,
            buildAchievementFormData({
              employeeId: a.employeeId,
              employeeName: a.employeeName,
              department: a.department,
              title: a.title,
              achievements: a.description,
              visibilityStatus: "hide",
            })
          )
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
      <div className="space-y-6">
        <BreadCrumb />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Total Achievements" value={totalAchievements} icon={Award} color="burgundy" />
          <StatsCard title="Published" value={publishedCount} icon={CheckCircle} color="emerald-500" />
          <StatsCard title="Draft" value={draftCount} icon={FileText} color="amber-500" />
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Employee Recognitions</h3>
                <p className="text-sm text-slate-500 mt-1">Manage employee achievements and recognitions</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setMakeAllDraftOpen(true)}
                  variant="outline"
                  disabled={publishedCount === 0 || isUpdatingAll}
                  className="gap-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  <FileText className="h-4 w-4" />
                  Make All Draft
                </Button>
                <Button
                  onClick={() => navigate("/achievements/create")}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by employee name, ID or title..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 h-10"
                  />
                </div>
                <Button variant="secondary" onClick={applySearch}>
                  Search
                </Button>
                {search && (
                  <Button variant="ghost" onClick={clearSearch}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
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
                <Button onClick={() => navigate("/achievements/create")} className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
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
                          key={achievement.id}
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
                              <button onClick={() => navigate(`/achievements/view/${achievement.id}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10" title="View">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => navigate(`/achievements/edit/${achievement.id}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10" title="Edit">
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
                              <button onClick={() => handleDeleteClick(achievement)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-end gap-2">
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
