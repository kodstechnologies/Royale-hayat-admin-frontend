import { useEffect, useState } from "react";
import { Eye, Filter, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getAllExternalApiLogs,
  ExternalApiLogRecord,
  ExternalApiLogFilters,
} from "@/api/externalApiLogs";
import TableSkeletonLoader from "@/components/TableSkeletonLoader";
import { format } from "date-fns";

const ExternalApiLogs = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ExternalApiLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedLog, setSelectedLog] = useState<ExternalApiLogRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<ExternalApiLogFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAllExternalApiLogs({
        ...filters,
        page: currentPage,
      });
      
      if (response.success) {
        setLogs(response.data);
        setTotalPages(response.meta.pages);
        setTotalRecords(response.meta.total);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const handleViewResponse = (log: ExternalApiLogRecord) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const handleFilterChange = (key: keyof ExternalApiLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md transition-colors ${
            i === currentPage
              ? "bg-burgundy text-white"
              : "bg-white text-slate-700 hover:bg-burgundy/10"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t("External API Logs")}
        </h1>
        <p className="text-slate-600">
          {t("View logs from Identity and Royal Hayat API services")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-burgundy" />
            <span className="font-semibold text-slate-700">{t("Filters")}</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            {showFilters ? "−" : "+"}
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-slate-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("Service")}
              </label>
              <select
                value={filters.service || ""}
                onChange={(e) => handleFilterChange("service", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">{t("All Services")}</option>
                <option value="identity">{t("Identity")}</option>
                <option value="royalhayat">{t("Royal Hayat")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("Status")}
              </label>
              <select
                value={filters.success || ""}
                onChange={(e) => handleFilterChange("success", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">{t("All Status")}</option>
                <option value="true">{t("Success")}</option>
                <option value="false">{t("Failed")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("Search")}
              </label>
              <input
                type="text"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder={t("Civil ID, Patient ID...")}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-burgundy hover:bg-burgundy/10 rounded-md transition-colors"
              >
                {t("Clear Filters")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeletonLoader columns={6} rows={10} />
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">{t("No logs found")}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Service")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Civil ID")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Endpoint")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("Response")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.service === "identity"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {log.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {log.civilId || log.patientId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.success ? t("Success") : t("Failed")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="max-w-xs truncate" title={log.endpoint}>
                        {log.endpoint}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewResponse(log)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-white transition-colors"
                        title={t("View Response")}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {t("Showing")} {(currentPage - 1) * 10 + 1} {t("to")}{" "}
              {Math.min(currentPage * 10, totalRecords)} {t("of")} {totalRecords}{" "}
              {t("results")}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white text-slate-700 hover:bg-burgundy/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("Previous")}
              </button>
              {renderPagination()}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white text-slate-700 hover:bg-burgundy/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("Next")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {t("API Log Details")}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Service")}
                    </label>
                    <p className="text-slate-800 font-medium">
                      {selectedLog.service}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Method")}
                    </label>
                    <p className="text-slate-800 font-medium">
                      {selectedLog.method}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Civil ID")}
                    </label>
                    <p className="text-slate-800">{selectedLog.civilId || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Patient ID")}
                    </label>
                    <p className="text-slate-800">{selectedLog.patientId || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Status Code")}
                    </label>
                    <p className="text-slate-800">{selectedLog.statusCode || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      {t("Response Time")}
                    </label>
                    <p className="text-slate-800">
                      {selectedLog.responseTime ? `${selectedLog.responseTime}ms` : "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">
                    {t("Endpoint")}
                  </label>
                  <p className="text-slate-800 break-all">{selectedLog.endpoint}</p>
                </div>

                {selectedLog.errorMessage && (
                  <div>
                    <label className="block text-sm font-medium text-red-500 mb-1">
                      {t("Error Message")}
                    </label>
                    <p className="text-red-700 bg-red-50 p-3 rounded-md">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    {t("Request Data")}
                  </label>
                  <pre className="bg-slate-50 p-4 rounded-md overflow-x-auto text-xs text-slate-800">
                    {JSON.stringify(selectedLog.requestData, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    {t("Response Data")}
                  </label>
                  <pre className="bg-slate-50 p-4 rounded-md overflow-x-auto text-xs text-slate-800">
                    {JSON.stringify(selectedLog.responseData, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">
                    {t("Created At")}
                  </label>
                  <p className="text-slate-800">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-burgundy text-white rounded-md hover:bg-burgundy/90 transition-colors"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalApiLogs;
