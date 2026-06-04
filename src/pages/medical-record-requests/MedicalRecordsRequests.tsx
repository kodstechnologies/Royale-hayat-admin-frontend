import { useState, useEffect, useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import AdminLayout from "@/components/layout/AdminLayout";

import BreadCrumb from "@/components/layout/BreadCrumb";

import { Search, Eye, Trash2, FileText, Clock, CheckCircle } from "lucide-react";

import {

  deleteMedicalRecordRequest,

  getAllMedicalRequests,

} from "@/api/medicalRecordRequest";

import AlertBox from "@/components/AlertBox";

import { toast } from "sonner";

import { PERMISSIONS } from "@/constants/permissions";

import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

import {

  formatDateShort,

  mapListItem,

  matchesSearch,

  type MedicalRecordRequestListItem,

} from "./medicalRecordRequestUtils";



type StatusFilter = "all" | "pending" | "received";



const MedicalRecordsRequests = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [requests, setRequests] = useState<MedicalRecordRequestListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [requestToDelete, setRequestToDelete] = useState<MedicalRecordRequestListItem | null>(

    null,

  );

  const [isDeleting, setIsDeleting] = useState(false);



  const fetchRequests = useCallback(async () => {

    setLoading(true);

    try {

      const res = await getAllMedicalRequests();

      const list = res?.data ?? res ?? [];



      if (Array.isArray(list)) {

        setRequests(

          list.map((row) => mapListItem(row as Record<string, unknown>)),

        );

      } else {

        setRequests([]);

      }

    } catch {

      toast.error("Failed to load medical record requests");

      setRequests([]);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    void fetchRequests();

  }, [fetchRequests]);



  const filtered = useMemo(() => {

    return requests.filter((item) => {

      if (statusFilter === "pending" && item.status !== "pending") return false;

      if (statusFilter === "received" && item.status !== "received") return false;

      return matchesSearch(item, search);

    });

  }, [requests, search, statusFilter]);



  const counts = useMemo(

    () => ({

      total: requests.length,

      pending: requests.filter((r) => r.status === "pending").length,

      received: requests.filter((r) => r.status === "received").length,

    }),

    [requests],

  );



  const canDelete = hasPermission(PERMISSIONS.MRR_DELETE);



  const handleDeleteClick = (request: MedicalRecordRequestListItem) => {

    if (!hasPermission(PERMISSIONS.MRR_DELETE)) return;

    setRequestToDelete(request);

    setDeleteOpen(true);

  };



  const confirmDelete = async () => {

    if (!requestToDelete || !hasPermission(PERMISSIONS.MRR_DELETE)) return;



    setIsDeleting(true);

    try {

      await deleteMedicalRecordRequest(requestToDelete.id);

      toast.success("Medical record request deleted successfully");

      setDeleteOpen(false);

      setRequestToDelete(null);

      await fetchRequests();

    } catch (error: unknown) {

      const err = error as { response?: { data?: { message?: string } } };

      toast.error(

        err?.response?.data?.message ||

          "Failed to delete medical record request",

      );

    } finally {

      setIsDeleting(false);

    }

  };



  const renderStatusBadge = (status: MedicalRecordRequestListItem["status"]) =>

    status === "pending" ? (

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">

        <Clock className="h-3 w-3" />

        New

      </span>

    ) : (

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">

        <CheckCircle className="h-3 w-3" />

        Viewed

      </span>

    );



  const statusFilters: { key: StatusFilter; label: string }[] = [

    { key: "all", label: "All" },

    { key: "pending", label: "New" },

    { key: "received", label: "Viewed" },

  ];



  return (

    <AdminLayout title="Medical Records Requests">

      <div className="space-y-4 sm:space-y-6">

        <BreadCrumb />



        <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-3 sm:gap-4">

          <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">Total Requests</p>

                <p className="text-2xl font-bold text-slate-800">{counts.total}</p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">

                <FileText className="h-5 w-5 text-burgundy" />

              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">New Requests</p>

                <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">

                <Clock className="h-5 w-5 text-amber-600" />

              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">Viewed Requests</p>

                <p className="text-2xl font-bold text-green-600">{counts.received}</p>

              </div>

              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">

                <CheckCircle className="h-5 w-5 text-green-600" />

              </div>

            </div>

          </div>

        </div>



        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">

          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />



          <div className="p-4 sm:p-6">

            <div className="mb-4 sm:mb-6">

              <h3 className="text-lg sm:text-xl font-bold text-slate-800">

                Medical Records Requests

              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">

                Patient authorization forms submitted from the website — patient details,

                authorization scope, recipient, and requestor information

              </p>

            </div>



            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center mb-4 sm:mb-6">

              <div className="relative w-full sm:max-w-md sm:flex-1">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input

                  type="text"

                  placeholder="Search MRR ID, patient, file no., recipient, purpose..."

                  value={search}

                  onChange={(e) => setSearch(e.target.value)}

                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"

                />

              </div>

              <div className="flex flex-wrap gap-2">

                {statusFilters.map(({ key, label }) => (

                  <button

                    key={key}

                    type="button"

                    onClick={() => setStatusFilter(key)}

                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${

                      statusFilter === key

                        ? "bg-burgundy text-white border-burgundy"

                        : "border-slate-200 text-slate-600 hover:border-burgundy"

                    }`}

                  >

                    {label}

                  </button>

                ))}

              </div>

            </div>



            {loading ? (

              <div className="space-y-3">

                {Array.from({ length: 5 }).map((_, i) => (

                  <div

                    key={i}

                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 animate-pulse"

                  >

                    <div className="h-4 bg-slate-200 rounded w-24" />

                    <div className="flex-1 space-y-1.5">

                      <div className="h-4 bg-slate-200 rounded w-1/3" />

                      <div className="h-3 bg-slate-100 rounded w-1/4" />

                    </div>

                    <div className="h-4 bg-slate-100 rounded w-20" />

                    <div className="h-7 w-7 bg-slate-100 rounded-lg" />

                  </div>

                ))}

              </div>

            ) : filtered.length === 0 ? (

              <div className="text-center py-16">

                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">

                  <FileText className="h-10 w-10 text-slate-400" />

                </div>

                <p className="text-slate-500 font-medium">No requests found</p>

                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>

              </div>

            ) : (

              <>

                <div className="md:hidden space-y-3">

                  {filtered.map((request) => (

                    <article

                      key={request.id}

                      role="button"

                      tabIndex={0}

                      onClick={() => navigate(`/medical-record/view/${request.id}`)}

                      onKeyDown={(e) => {

                        if (e.key === "Enter" || e.key === " ") {

                          e.preventDefault();

                          navigate(`/medical-record/view/${request.id}`);

                        }

                      }}

                      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50 transition-colors ${

                        !request.isViewed ? "ring-1 ring-burgundy/20" : ""

                      }`}

                    >

                      <div className="flex items-start justify-between gap-2 mb-3">

                        <span className="font-mono text-xs font-semibold text-burgundy break-all">

                          {request.mrrId}

                        </span>

                        {renderStatusBadge(request.status)}

                      </div>

                      <div className="space-y-2 mb-3 text-sm">

                        <p className="font-medium text-slate-800">{request.patientName}</p>

                        <p className="text-xs text-slate-500">

                          URN: {request.patientFileNo} · DOB: {request.dateOfBirth}

                        </p>

                        <p className="text-xs text-slate-600">

                          <span className="font-medium">Authorization:</span>{" "}

                          {request.authorizationLabel}

                        </p>

                        <p className="text-xs text-slate-600">

                          <span className="font-medium">Service:</span> {request.servicePeriod}

                        </p>

                        <p className="text-xs text-slate-600">

                          <span className="font-medium">Recipient:</span> {request.recipientName}

                        </p>

                        <p className="text-xs text-slate-600">

                          <span className="font-medium">Purpose:</span> {request.purposeLabel}

                        </p>

                        <p className="text-xs text-slate-500">

                          {request.requestedBy} · {formatDateShort(request.requestDate)}

                        </p>

                      </div>

                      <div

                        className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100"

                        onClick={(e) => e.stopPropagation()}

                      >

                        <button

                          type="button"

                          onClick={() => navigate(`/medical-record/view/${request.id}`)}

                          className={`${canDelete ? "flex-1 sm:flex-none" : "w-full"} inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-burgundy bg-burgundy/10 hover:bg-burgundy/15 transition-colors`}

                        >

                          <Eye size={16} />

                          View

                        </button>

                        <PermissionGate permission={PERMISSIONS.MRR_DELETE}>

                          <button

                            type="button"

                            onClick={() => handleDeleteClick(request)}

                            className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"

                            aria-label="Delete request"

                          >

                            <Trash2 size={16} />

                          </button>

                        </PermissionGate>

                      </div>

                    </article>

                  ))}

                </div>



                <div className="hidden md:block overflow-x-auto -mx-1 sm:mx-0">

                  <table className="w-full min-w-[1100px]">

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50/50">

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          MRR ID

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Patient

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Authorization

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Service Period

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Recipient

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Purpose

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Requested By

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Submitted

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Status

                        </th>

                        <th className="text-left py-3 px-3 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">

                          Actions

                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filtered.map((request, index) => (

                        <tr

                          key={request.id}

                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer ${

                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"

                          } ${!request.isViewed ? "bg-burgundy/[0.02]" : ""}`}

                          onClick={() => navigate(`/medical-record/view/${request.id}`)}

                        >

                          <td className="py-3 px-3">

                            <span className="font-mono text-xs font-semibold text-burgundy">

                              {request.mrrId}

                            </span>

                          </td>

                          <td className="py-3 px-3">

                            <div className="font-medium text-slate-800 text-sm">

                              {request.patientName}

                            </div>

                            <div className="text-[11px] text-slate-400">

                              URN: {request.patientFileNo}

                            </div>

                            <div className="text-[11px] text-slate-400">

                              DOB: {request.dateOfBirth} · {request.identificationLabel}

                            </div>

                          </td>

                          <td className="py-3 px-3 text-sm text-slate-600 max-w-[140px]">

                            {request.authorizationLabel}

                          </td>

                          <td className="py-3 px-3 text-sm text-slate-600 whitespace-nowrap">

                            {request.servicePeriod}

                          </td>

                          <td className="py-3 px-3">

                            <div className="text-sm text-slate-700">{request.recipientName}</div>

                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">

                              {request.recipientEmail}

                            </div>

                          </td>

                          <td className="py-3 px-3 text-sm text-slate-600 max-w-[140px]">

                            {request.purposeLabel}

                          </td>

                          <td className="py-3 px-3 text-sm text-slate-600">

                            {request.requestedBy}

                          </td>

                          <td className="py-3 px-3 text-sm text-slate-500 whitespace-nowrap">

                            {formatDateShort(request.requestDate)}

                          </td>

                          <td className="py-3 px-3">{renderStatusBadge(request.status)}</td>

                          <td className="py-3 px-3">

                            <div

                              className="flex items-center gap-1"

                              onClick={(e) => e.stopPropagation()}

                            >

                              <button

                                type="button"

                                onClick={() =>

                                  navigate(`/medical-record/view/${request.id}`)

                                }

                                className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"

                                title="View Details"

                              >

                                <Eye size={16} />

                              </button>

                              <PermissionGate permission={PERMISSIONS.MRR_DELETE}>

                                <button

                                  type="button"

                                  onClick={() => handleDeleteClick(request)}

                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"

                                  title="Delete"

                                >

                                  <Trash2 size={16} />

                                </button>

                              </PermissionGate>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>



                {filtered.length > 0 && (

                  <p className="text-xs text-slate-400 text-center md:text-right pt-3">

                    Showing {filtered.length} of {requests.length} requests

                  </p>

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

          setRequestToDelete(null);

        }}

        onConfirm={confirmDelete}

        title="Delete Medical Record Request"

        message={`Are you sure you want to delete the request for "${requestToDelete?.patientName}" (${requestToDelete?.mrrId})? This action cannot be undone.`}

        confirmText="Delete"

        cancelText="Cancel"

        isDeleting={isDeleting}

      />

    </AdminLayout>

  );

};



export default MedicalRecordsRequests;

