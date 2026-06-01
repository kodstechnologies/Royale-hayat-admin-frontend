import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, FileText, Download, Upload, QrCode, MessageSquare, Phone, Send, Copy, X, Check, Calendar, Image, File, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import QRCode from "qrcode";

import {
  createDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
} from "@/api/document";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type AdminDoc = {
  id: string;
  title: string;
  category: string;
  description: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  uploadedBy: string;
  sharedVia: ("SMS" | "WhatsApp" | "QR Code")[];
  timesShared: number;
  status: "Active" | "Draft";
};

const catStyles: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
  Brochure: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", hoverBg: "hover:bg-rose-100" },
  Form: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hoverBg: "hover:bg-blue-100" },
  Guide: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hoverBg: "hover:bg-emerald-100" },
  Policy: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hoverBg: "hover:bg-amber-100" },
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText size={24} className="text-red-500" />;
    case "jpg":
    case "jpeg":
    case "png":
      return <Image size={24} className="text-blue-500" />;
    default:
      return <File size={24} className="text-slate-500" />;
  }
};

const Documents = () => {
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState<AdminDoc | null>(null);
  const [showViewModal, setShowViewModal] = useState<AdminDoc | null>(null);
  const [showEditModal, setShowEditModal] = useState<AdminDoc | null>(null);
  const [shareMethod, setShareMethod] = useState<"sms" | "whatsapp" | "qr" | "link" | null>(null);
  const [shareInput, setShareInput] = useState("");
  const [shareSent, setShareSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [uploadForm, setUploadForm] = useState({ title: "", category: "Brochure", description: "", file: null as File | null });
  const [uploadProgress, setUploadProgress] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", category: "", description: "", file: null as File | null, existingFileUrl: "" });
  const [editProgress, setEditProgress] = useState(false);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [generatingQr, setGeneratingQr] = useState(false);
  const [docToDelete, setDocToDelete] = useState<AdminDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useLanguage();

  const mapApiDoc = (d: Record<string, unknown>): AdminDoc => {
    const fileUrl = String(d.file ?? d.fileUrl ?? "");
    const pathPart = fileUrl.split("?")[0];
    const fileType = pathPart.split(".").pop()?.toLowerCase() ?? "pdf";

    return {
      id: String(d._id ?? d.id ?? ""),
      title: String(d.title ?? ""),
      category: String(d.catagory ?? d.category ?? "Brochure"),
      description: String(d.description ?? ""),
      uploadDate: d.createdAt
        ? String(d.createdAt).split("T")[0]
        : new Date().toISOString().split("T")[0],
      fileSize: d.fileSize ? String(d.fileSize) : "—",
      fileType,
      fileUrl,
      uploadedBy: String(d.uploadedBy ?? "Admin"),
      sharedVia: (d.sharedVia as AdminDoc["sharedVia"]) ?? [],
      timesShared: Number(d.timesShared ?? 0),
      status: d.status === "inactive" ? "Draft" : "Active",
    };
  };

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllDocuments();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setDocs(list.map((item: Record<string, unknown>) => mapApiDoc(item)));
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const categories = ["All", ...Array.from(new Set(docs.map(d => d.category)))];

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedDocs = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, JPEG, and PDF files are allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, JPEG, and PDF files are allowed");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setEditForm({ ...editForm, file });
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!hasPermission(PERMISSIONS.DOCUMENT_CREATE)) return;
    if (!uploadForm.title) { toast.error("Please enter document title"); return; }
    if (!uploadForm.file) { toast.error("Please select a file to upload"); return; }

    setUploadProgress(true);
    try {
      await createDocument({
        title: uploadForm.title,
        catagory: uploadForm.category as "Brochure" | "Form" | "Guide" | "Policy",
        description: uploadForm.description || uploadForm.title,
        status: "active",
        file: uploadForm.file,
      });
      setUploadForm({ title: "", category: "Brochure", description: "", file: null });
      setShowUpload(false);
      await fetchDocs();
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleEdit = async () => {
    if (!hasPermission(PERMISSIONS.DOCUMENT_UPDATE)) return;
    if (!editForm.title) { toast.error("Please enter document title"); return; }
    if (!showEditModal) return;

    setEditProgress(true);
    try {
      const payload: any = {
        title: editForm.title,
        catagory: editForm.category as "Brochure" | "Form" | "Guide" | "Policy",
        description: editForm.description,
      };
      if (editForm.file) payload.file = editForm.file;

      await updateDocument(showEditModal.id, payload);

      toast.success("Document updated successfully!");
      setShowEditModal(null);
      setEditForm({ title: "", category: "", description: "", file: null, existingFileUrl: "" });
      setEditPreviewUrl("");
      await fetchDocs();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update document");
    } finally {
      setEditProgress(false);
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete || !hasPermission(PERMISSIONS.DOCUMENT_DELETE)) return;

    setDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success(`"${docToDelete.title}" deleted`);
      setDocToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete document. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const generateQRCode = async (doc: AdminDoc) => {
    setGeneratingQr(true);
    try {
      const documentLink = doc.fileUrl || `${window.location.origin}/documents/${doc.id}`;
      const qrDataUrl = await QRCode.toDataURL(documentLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      toast.success("QR Code generated successfully!");
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleShare = async () => {
    if (shareMethod === "link") {
      const link = showShareModal?.fileUrl || window.location.href;
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
      setShowShareModal(null);
      setShareMethod(null);
      setShareInput("");
      setQrCodeDataUrl("");
      return;
    }

    if (shareMethod === "qr") {
      if (showShareModal) {
        await generateQRCode(showShareModal);
      }
      return;
    }

    if (shareMethod === "sms" || shareMethod === "whatsapp") {
      toast.info("SMS and WhatsApp sharing are currently disabled");
      return;
    }

    setShareSent(true);
    setTimeout(() => {
      setShareSent(false);
      setShareMethod(null);
      setShareInput("");
      setShowShareModal(null);
      setQrCodeDataUrl("");
      toast.success("Document shared successfully!");
    }, 2000);
  };

  const handleDownload = (doc: AdminDoc) => {
    if (!doc.fileUrl) {
      toast.info("No file available");
      return;
    }

    window.open(doc.fileUrl, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    return catStyles[category] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", hoverBg: "hover:bg-slate-100" };
  };

  const handleCardClick = (docId: string) => {
    setSelectedCard(docId);
    setTimeout(() => setSelectedCard(null), 300);
  };

  useEffect(() => {
    return () => {
      docs.forEach(doc => {
        if (doc.fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(doc.fileUrl);
        }
      });
    };
  }, [docs]);

  return (
    <AdminLayout title="Documents">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Document Management</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Upload and manage documents to share with patients</p>
              </div>
              <PermissionGate permission={PERMISSIONS.DOCUMENT_CREATE}>
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </PermissionGate>
            </div>

            
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(c => {
                  const isActive = filterCat === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => {
                        setFilterCat(c);
                        setCurrentPage(1);
                      }}
                      className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isActive
                          ? "bg-burgundy text-white shadow-md shadow-burgundy/20 scale-105"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                      {c}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents by title or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              />
            </div>

            
            {showUpload && hasPermission(PERMISSIONS.DOCUMENT_CREATE) && (
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 animate-in fade-in duration-200">
                <h4 className="text-sm sm:text-md font-semibold text-slate-800 mb-4">Upload New Document</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Document Title *</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                      placeholder="Enter document title"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    >
                      <option>Brochure</option>
                      <option>Form</option>
                      <option>Guide</option>
                      <option>Policy</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Enter document description"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Upload File * (PDF, JPG, PNG - Max 5MB)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-burgundy/50 transition-all">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          {uploadForm.file ? uploadForm.file.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setShowUpload(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button onClick={handleUpload} disabled={uploadProgress} className="bg-burgundy hover:bg-burgundy/90 w-full sm:w-auto">
                    {uploadProgress ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </div>
            )}

            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-100 rounded" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : paginatedDocs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No documents found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {paginatedDocs.map((doc) => {
                    const categoryStyle = getCategoryColor(doc.category);
                    const isSelected = selectedCard === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`group bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer ${isSelected
                            ? "shadow-2xl shadow-burgundy/20 scale-[1.02] ring-2 ring-burgundy/30"
                            : "shadow-sm hover:shadow-xl hover:-translate-y-1"
                          }`}
                        onClick={() => {
                          handleCardClick(doc.id);
                          setShowViewModal(doc);
                        }}
                      >
                        <div className="p-4 sm:p-5">
                          
                          <div className="flex items-start justify-between mb-3 min-w-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                                {getFileIcon(doc.fileType)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-800 line-clamp-2 sm:line-clamp-1 text-sm sm:text-base">{doc.title}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}>
                                    {doc.category}
                                  </span>
                                  {doc.status === "Draft" && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      Draft
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{doc.description}</p>

                          
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(doc.uploadDate)}</span>
                            </div>
                          </div>

                          
                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc);
                              }}
                              className="flex-1 min-w-[calc(50%-4px)] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-burgundy/5 hover:border-burgundy/30 transition-all"
                            >
                              <Download size={12} />
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowShareModal(doc);
                              }}
                              className="flex-1 min-w-[calc(50%-4px)] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-burgundy/5 hover:border-burgundy/30 transition-all"
                            >
                              <Send size={12} />
                              Share
                            </button>
                            <PermissionGate permission={PERMISSIONS.DOCUMENT_UPDATE}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditForm({
                                    title: doc.title,
                                    category: doc.category,
                                    description: doc.description,
                                    file: null,
                                    existingFileUrl: doc.fileUrl || ""
                                  });
                                  setEditPreviewUrl(doc.fileUrl || "");
                                  setShowEditModal(doc);
                                }}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-burgundy/5 hover:border-burgundy/30 transition-all"
                                aria-label="Edit document"
                              >
                                <Pencil size={12} />
                                <span className="sm:hidden">Edit</span>
                              </button>
                            </PermissionGate>
                            <PermissionGate permission={PERMISSIONS.DOCUMENT_DELETE}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDocToDelete(doc);
                                }}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                                aria-label="Delete document"
                              >
                                <X size={12} />
                                <span className="sm:hidden">Delete</span>
                              </button>
                            </PermissionGate>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
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
                                className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${currentPage === pageNum
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
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          Next
                        </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowViewModal(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-burgundy/5 to-white border-b border-slate-100 p-4 sm:p-5 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
                    {getFileIcon(showViewModal.fileType)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 line-clamp-2">{showViewModal.title}</h3>
                    <p className="text-xs text-slate-500">{showViewModal.category}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowViewModal(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0" aria-label="Close">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <p className="text-sm text-slate-700 mt-1">{showViewModal.description}</p>
              </div>

              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Date</label>
                  <p className="text-sm text-slate-700 mt-1">{formatDate(showViewModal.uploadDate)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <p className="text-sm text-slate-700 mt-1">{showViewModal.status}</p>
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-6 sm:p-8 text-center mb-6">
                {showViewModal.fileType === "pdf" ? (
                  <FileText size={48} className="text-red-500 mx-auto mb-3" />
                ) : showViewModal.fileType === "jpg" || showViewModal.fileType === "jpeg" || showViewModal.fileType === "png" ? (
                  <Image size={48} className="text-blue-500 mx-auto mb-3" />
                ) : (
                  <File size={48} className="text-slate-500 mx-auto mb-3" />
                )}
                <p className="text-sm text-slate-500">Preview not available</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button onClick={() => handleDownload(showViewModal)} className="w-full sm:flex-1 gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Download className="h-4 w-4" />
                  Download Document
                </Button>
                <Button onClick={() => setShowViewModal(null)} variant="outline" className="w-full sm:flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowEditModal(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-burgundy/5 to-white border-b border-slate-100 p-4 sm:p-5 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
                    <Pencil className="h-5 w-5 text-burgundy" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Edit Document</h3>
                    <p className="text-xs text-slate-500">Update document details</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowEditModal(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0" aria-label="Close">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Document Title *</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter document title"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  >
                    <option>Brochure</option>
                    <option>Form</option>
                    <option>Guide</option>
                    <option>Policy</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter document description"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Replace File (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-burgundy/50 transition-all">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleEditFileUpload}
                      className="hidden"
                      id="edit-file-upload"
                    />
                    <label htmlFor="edit-file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">
                        {editForm.file ? editForm.file.name : "Click to upload new file"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                    </label>
                  </div>
                  {editPreviewUrl && !editForm.file && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-slate-500">Current file: {editPreviewUrl.split('/').pop()?.slice(0, 30)}...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowEditModal(null)} className="w-full sm:flex-1">
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={editProgress} className="w-full sm:flex-1 bg-burgundy hover:bg-burgundy/90">
                  {editProgress ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => {
          setShowShareModal(null);
          setQrCodeDataUrl("");
          setShareMethod(null);
        }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-burgundy/5 to-white border-b border-slate-100 p-4 sm:p-5 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
                    <Send className="h-5 w-5 text-burgundy" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Share Document</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{showShareModal.title}</p>
                  </div>
                </div>
                <button type="button" onClick={() => {
                  setShowShareModal(null);
                  setQrCodeDataUrl("");
                  setShareMethod(null);
                }} className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0" aria-label="Close">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {shareSent ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check size={28} className="text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-800">Sent successfully!</p>
                  <p className="text-sm text-slate-500 mt-1">The document has been shared.</p>
                </div>
              ) : shareMethod === null ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => setShareMethod("sms")} 
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed opacity-60 transition-all group"
                    disabled
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Phone size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">Send via SMS</p>
                      <p className="text-xs text-slate-500">Currently disabled</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setShareMethod("whatsapp")} 
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed opacity-60 transition-all group"
                    disabled
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <MessageSquare size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">Send via WhatsApp</p>
                      <p className="text-xs text-slate-500">Currently disabled</p>
                    </div>
                  </button>
                  <button onClick={() => setShareMethod("qr")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <QrCode size={18} className="text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">Generate QR Code</p>
                      <p className="text-xs text-slate-500">Generate QR code for document access</p>
                    </div>
                  </button>
                  <button onClick={() => setShareMethod("link")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Copy size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800">Copy Link</p>
                      <p className="text-xs text-slate-500">Copy document link to clipboard</p>
                    </div>
                  </button>
                </div>
              ) : shareMethod === "qr" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <QrCode size={18} className="text-purple-600" />
                    <span className="text-sm font-semibold text-slate-800">Generate QR Code</span>
                  </div>
                  <div className="flex flex-col items-center py-4">
                    {generatingQr ? (
                      <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : qrCodeDataUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                        <p className="text-xs text-slate-500 text-center">
                          Scan this QR code to access the document
                        </p>
                        <Button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `qr-code-${showShareModal?.title}.png`;
                            link.href = qrCodeDataUrl;
                            link.click();
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Download QR Code
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => generateQRCode(showShareModal)}
                        className="w-40 h-40 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                      >
                        <QrCode size={48} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Generate QR</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => {
                        setShareMethod(null);
                        setQrCodeDataUrl("");
                      }} 
                      variant="outline" 
                      className="w-full sm:flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowShareModal(null);
                        setQrCodeDataUrl("");
                        setShareMethod(null);
                        toast.success("QR Code generated successfully!");
                      }} 
                      className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={!qrCodeDataUrl}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : shareMethod === "link" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Copy size={18} className="text-amber-600" />
                    <span className="text-sm font-semibold text-slate-800">Copy Link</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-600 break-all">
                      {showShareModal?.fileUrl || `${window.location.origin}/documents/${showShareModal?.id}`}
                    </p>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => {
                        setShareMethod(null);
                        setQrCodeDataUrl("");
                      }} 
                      variant="outline" 
                      className="w-full sm:flex-1"
                    >
                      Back
                    </Button>
                    <Button onClick={handleShare} className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700">
                      Copy Link
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {shareMethod === "sms" && <Phone size={18} className="text-blue-600" />}
                    {shareMethod === "whatsapp" && <MessageSquare size={18} className="text-green-600" />}
                    <span className="text-sm font-semibold text-slate-800">
                      {shareMethod === "sms" && "Send via SMS"}
                      {shareMethod === "whatsapp" && "Send via WhatsApp"}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                      Patient Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shareInput}
                      onChange={e => setShareInput(e.target.value)}
                      placeholder="+965 XXXX XXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => {
                        setShareMethod(null);
                        setQrCodeDataUrl("");
                      }} 
                      variant="outline" 
                      className="w-full sm:flex-1"
                    >
                      Back
                    </Button>
                    <Button onClick={handleShare} disabled className="w-full sm:flex-1 bg-burgundy/50 cursor-not-allowed">
                      Send (Disabled)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {docToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => !deleting && setDocToDelete(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Delete document?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800 break-words">&quot;{docToDelete.title}&quot;</span>?
              This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDocToDelete(null)}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Documents;