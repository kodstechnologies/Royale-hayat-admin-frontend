import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";
import { Search, Eye, MessageSquare, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllChatLogs, type ChatLogRecord } from "@/api/chatLog";

const truncate = (text: string, max = 80) =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`;

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserChats = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ChatLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "ai" | "guided_topic">("all");
  const [langFilter, setLangFilter] = useState<"all" | "en" | "ar">("all");
  const [viewFilter, setViewFilter] = useState<"all" | "new" | "viewed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";
      const response = await getAllChatLogs({
        page: currentPage,
        limit,
        ...(effectiveSearch ? { search: effectiveSearch } : {}),
        ...(sourceFilter !== "all" ? { source: sourceFilter } : {}),
        ...(langFilter !== "all" ? { lang: langFilter } : {}),
        ...(viewFilter === "new" ? { isViewed: "false" as const } : {}),
        ...(viewFilter === "viewed" ? { isViewed: "true" as const } : {}),
      });
      setLogs(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.meta?.pages || 1);
      setTotalRecords(response.meta?.total || 0);
      setUnviewedCount(response.meta?.unviewedCount ?? 0);
    } catch {
      setLogs([]);
      setTotalPages(1);
      setTotalRecords(0);
      setUnviewedCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, sourceFilter, langFilter, viewFilter]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

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

  const sourceLabel = (source?: string) => {
    if (source === "guided_topic") return "Guided topic";
    if (source === "ai") return "AI chat";
    return "—";
  };

  const viewedBadge = (isViewed?: boolean) =>
    isViewed === true ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
        Viewed
      </span>
    ) : (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-burgundy/10 text-burgundy font-medium">
        New
      </span>
    );

  return (
    <AdminLayout title="User Chats">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">User Chats</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Website chatbot conversations from the public site
                </p>
              </div>
              {unviewedCount > 0 && (
                <span className="inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold bg-burgundy/10 text-burgundy">
                  {unviewedCount} new
                </span>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search by reference, question or reply..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSourceFilter(e.target.value as typeof sourceFilter);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              >
                <option value="all">All sources</option>
                <option value="ai">AI chat</option>
                <option value="guided_topic">Guided topic</option>
              </select>
              <select
                value={langFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setLangFilter(e.target.value as typeof langFilter);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              >
                <option value="all">All languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
              <select
                value={viewFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setViewFilter(e.target.value as typeof viewFilter);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
              >
                <option value="all">All status</option>
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
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

            {loading ? (
              <TableSkeletonLoader columns={8} rows={8} />
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No chat logs found</p>
                <p className="text-sm text-slate-400 mt-1">
                  Conversations will appear here when users chat on the website
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                          User message
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                          Reply
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">
                          Source
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">
                          Lang
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr
                          key={log._id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          } ${log.isViewed !== true ? "bg-burgundy/[0.02]" : ""}`}
                          onClick={() => navigate(`/user-chats/view/${log._id}`)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold text-burgundy">
                              {log.referenceId || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-800 max-w-[220px]">
                            {truncate(log.lastUserMessage || "—")}
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell text-sm text-slate-600 max-w-[260px]">
                            {truncate(log.assistantReply || "—")}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                log.source === "guided_topic"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-violet-50 text-violet-700"
                              }`}
                            >
                              {log.source === "guided_topic" ? (
                                <Sparkles className="h-3 w-3" />
                              ) : (
                                <Bot className="h-3 w-3" />
                              )}
                              {sourceLabel(log.source)}
                            </span>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-xs uppercase text-slate-500">
                            {log.lang || "—"}
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-500">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="py-3 px-4">{viewedBadge(log.isViewed)}</td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user-chats/view/${log._id}`);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View"
                            >
                              <Eye
                                size={14}
                                className="text-slate-400 group-hover:text-burgundy transition-colors"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-medium text-slate-700">
                          {(currentPage - 1) * limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-slate-700">
                          {Math.min(currentPage * limit, totalRecords)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-700">{totalRecords}</span>{" "}
                        chats
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1 || loading}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
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
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          disabled={currentPage === totalPages || loading}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
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
    </AdminLayout>
  );
};

export default UserChats;
