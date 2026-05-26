// FeedbackReviews.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  Star, MessageSquare, User, Building2, Search, X, Calendar,
  Quote, Globe, Eye, EyeOff, ChevronLeft, ChevronRight, Languages,
  Plus, Edit, Trash2, Shield, Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  getAllDoctorFeedbacks,
  deleteDoctorFeedback,
  updateDoctorFeedback,
  getAllHospitalFeedbacks,
  deleteHospitalFeedback,
  updateHospitalFeedback,
  type FeedbackPayload
} from "@/api/feedback";

type DoctorFeedback = {
  id: string;
  _id?: string;
  doctorId: string;
  patientName: string;
  patientNameAr: string;
  doctorName: string;
  doctorNameAr: string;
  doctorInitials: string;
  doctorDepartment: string;
  doctorDepartmentAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  showOnWebsite: boolean;
  addedByAdmin?: boolean;
};

type HospitalFeedback = {
  id: string;
  _id?: string;
  patientName: string;
  patientNameAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  showOnWebsite: boolean;
  addedByAdmin?: boolean;
};

const hasText = (value?: string) => Boolean(value?.trim());

const hasArabicFeedbackComment = (commentAr: string) => hasText(commentAr);

const hasEnglishFeedbackComment = (comment: string) => hasText(comment);

const isArabicOnlyFeedback = (comment: string, commentAr: string) =>
  hasArabicFeedbackComment(commentAr) && !hasEnglishFeedbackComment(comment);

const isEnglishOnlyFeedback = (comment: string, commentAr: string) =>
  hasEnglishFeedbackComment(comment) && !hasArabicFeedbackComment(commentAr);

const FeedbackReviews = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [showArabicContent, setShowArabicContent] = useState(false);
  const [doctorFeedbacks, setDoctorFeedbacks] = useState<DoctorFeedback[]>([]);
  const [hospitalFeedbacks, setHospitalFeedbacks] = useState<HospitalFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"doctor" | "hospital">("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [websiteFilter, setWebsiteFilter] = useState<"all" | "shown" | "hidden">("all");
  const [adminFilter, setAdminFilter] = useState<"all" | "admin" | "user">("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Edit modal states
  const [editingFeedback, setEditingFeedback] = useState<DoctorFeedback | HospitalFeedback | null>(null);
  const [editFormData, setEditFormData] = useState({
    patientName: "",
    patientNameAr: "",
    rating: 5,
    comment: "",
    commentAr: "",
    doctorId: "",
    doctorName: "",
    doctorNameAr: "",
    doctorDepartment: "",
    doctorDepartmentAr: "",
    showOnWebsite: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickLocalizedText = (english: string, arabic: string, useArabic: boolean) => {
    if (useArabic) return hasText(arabic) ? arabic : english;
    return hasText(english) ? english : arabic;
  };

  const matchesSelectedLanguage = (comment: string, commentAr: string) =>
    showArabicContent
      ? hasArabicFeedbackComment(commentAr)
      : hasEnglishFeedbackComment(comment);

  // Fetch doctor feedbacks
  const fetchDoctorFeedbacks = useCallback(async () => {
    try {
      const response = await getAllDoctorFeedbacks();
      const feedbacks = response?.data || response || [];
      
      const mappedFeedbacks: DoctorFeedback[] = feedbacks.map((fb: any) => {
        // Handle doctor object - it could be a populated object or just an ID
        let doctorData = {
          name: "",
          arabicName: "",
          initials: "",
          department: "",
          arabicDepartment: ""
        };
        
        if (fb.doctor) {
          if (typeof fb.doctor === 'object') {
            // Doctor is populated object
            doctorData = {
              name: fb.doctor.name || "",
              arabicName: fb.doctor.arabicName || "",
              initials: fb.doctor.initials || "",
              department: fb.doctor.department?.name || fb.doctor.department || "",
              arabicDepartment: fb.doctor.department?.arabicName || fb.doctor.arabicDepartment || "",
            };
          }
        }
        
        return {
          id: fb._id || fb.id,
          _id: fb._id || fb.id,
          doctorId: typeof fb.doctor === 'object' ? fb.doctor._id : fb.doctor,
          patientName: fb.userName || "",
          patientNameAr: fb.arabicUserName || "",
          doctorName: doctorData.name,
          doctorNameAr: doctorData.arabicName,
          doctorInitials: doctorData.initials || "",
          doctorDepartment: doctorData.department,
          doctorDepartmentAr: doctorData.arabicDepartment,
          rating: fb.stars || 5,
          comment: fb.feedback || "",
          commentAr: fb.arabicFeedback || "",
          date: fb.createdAt ? new Date(fb.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          showOnWebsite: fb.shownOnWebsite ?? true,
          addedByAdmin: fb.addedBy === "admin"
        };
      });
      
      setDoctorFeedbacks(mappedFeedbacks);
    } catch (error) {
      console.error("Error fetching doctor feedbacks:", error);
      toast.error(showArabicContent ? "فشل في تحميل ملاحظات الأطباء" : "Failed to load doctor feedbacks");
    }
  }, [showArabicContent]);

  // Fetch hospital feedbacks
  const fetchHospitalFeedbacks = useCallback(async () => {
    try {
      const response = await getAllHospitalFeedbacks();
      const feedbacks = response?.data || response || [];
      
      const mappedFeedbacks: HospitalFeedback[] = feedbacks.map((fb: any) => ({
        id: fb._id || fb.id,
        _id: fb._id || fb.id,
        patientName: fb.userName || "",
        patientNameAr: fb.arabicUserName || "",
        rating: fb.stars || 5,
        comment: fb.feedback || "",
        commentAr: fb.arabicFeedback || "",
        date: fb.createdAt ? new Date(fb.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        showOnWebsite: fb.shownOnWebsite ?? true,
        addedByAdmin: fb.addedBy === "admin"
      }));
      
      setHospitalFeedbacks(mappedFeedbacks);
    } catch (error) {
      console.error("Error fetching hospital feedbacks:", error);
      toast.error(showArabicContent ? "فشل في تحميل ملاحظات المستشفى" : "Failed to load hospital feedbacks");
    }
  }, [showArabicContent]);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDoctorFeedbacks(),
        fetchHospitalFeedbacks()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchDoctorFeedbacks, fetchHospitalFeedbacks]);

  // Toggle show on website
  const toggleShowOnWebsite = async (id: string, type: "doctor" | "hospital") => {
    try {
      if (type === "doctor") {
        const feedback = doctorFeedbacks.find(fb => fb.id === id);
        if (!feedback) return;
        
        const payload: FeedbackPayload = {
          userName: feedback.patientName,
          arabicUserName: feedback.patientNameAr,
          feedback: feedback.comment,
          arabicFeedback: feedback.commentAr,
          stars: feedback.rating,
          shownOnWebsite: !feedback.showOnWebsite,
          doctor: feedback.doctorId // Send only the doctor ID
        };
        
        await updateDoctorFeedback({
          id,
          data: payload,
        });
        
        setDoctorFeedbacks(prev =>
          prev.map(fb =>
            fb.id === id ? { ...fb, showOnWebsite: !fb.showOnWebsite } : fb
          )
        );
        toast.success(showArabicContent ? "تم تحديث ظهور الموقع" : "Website visibility updated");
      } else {
        const feedback = hospitalFeedbacks.find(fb => fb.id === id);
        if (!feedback) return;
        
        const payload: FeedbackPayload = {
          userName: feedback.patientName,
          arabicUserName: feedback.patientNameAr,
          feedback: feedback.comment,
          arabicFeedback: feedback.commentAr,
          stars: feedback.rating,
          shownOnWebsite: !feedback.showOnWebsite
        };
        
        await updateHospitalFeedback({
          id,
          data: payload,
        });
        
        setHospitalFeedbacks(prev =>
          prev.map(fb =>
            fb.id === id ? { ...fb, showOnWebsite: !fb.showOnWebsite } : fb
          )
        );
        toast.success(showArabicContent ? "تم تحديث ظهور الموقع" : "Website visibility updated");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error(showArabicContent ? "فشل في تحديث ظهور الموقع" : "Failed to update visibility");
    }
  };

  // Delete feedback
  const handleDelete = async (id: string, type: "doctor" | "hospital") => {
    if (!confirm(showArabicContent ? "هل أنت متأكد من حذف هذه الملاحظة؟" : "Are you sure you want to delete this feedback?")) {
      return;
    }
    
    try {
      if (type === "doctor") {
        await deleteDoctorFeedback(id);
        setDoctorFeedbacks(prev => prev.filter(fb => fb.id !== id));
        toast.success(showArabicContent ? "تم حذف ملاحظة الطبيب بنجاح" : "Doctor feedback deleted successfully");
      } else {
        await deleteHospitalFeedback(id);
        setHospitalFeedbacks(prev => prev.filter(fb => fb.id !== id));
        toast.success(showArabicContent ? "تم حذف ملاحظة المستشفى بنجاح" : "Hospital feedback deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error(showArabicContent ? "فشل في حذف الملاحظة" : "Failed to delete feedback");
    }
  };

  // Open edit modal
  const openEditModal = (feedback: DoctorFeedback | HospitalFeedback, type: "doctor" | "hospital") => {
    setEditingFeedback(feedback);
    setEditFormData({
      patientName: feedback.patientName,
      patientNameAr: feedback.patientNameAr,
      rating: feedback.rating,
      comment: feedback.comment,
      commentAr: feedback.commentAr,
      doctorId: type === "doctor" ? (feedback as DoctorFeedback).doctorId : "",
      doctorName: type === "doctor" ? (feedback as DoctorFeedback).doctorName : "",
      doctorNameAr: type === "doctor" ? (feedback as DoctorFeedback).doctorNameAr : "",
      doctorDepartment: type === "doctor" ? (feedback as DoctorFeedback).doctorDepartment : "",
      doctorDepartmentAr: type === "doctor" ? (feedback as DoctorFeedback).doctorDepartmentAr : "",
      showOnWebsite: feedback.showOnWebsite
    });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingFeedback) return;
    
    setIsSubmitting(true);
    try {
      if (activeTab === "doctor") {
        const payload: FeedbackPayload = {
          userName: editFormData.patientName,
          arabicUserName: editFormData.patientNameAr,
          feedback: editFormData.comment,
          arabicFeedback: editFormData.commentAr,
          stars: editFormData.rating,
          shownOnWebsite: editFormData.showOnWebsite,
          doctor: editFormData.doctorId // Send only the doctor ID
        };
        
        await updateDoctorFeedback({
          id: editingFeedback.id,
          data: payload,
        });
        
        // Update local state
        setDoctorFeedbacks(prev =>
          prev.map(fb =>
            fb.id === editingFeedback.id
              ? {
                  ...fb,
                  patientName: editFormData.patientName,
                  patientNameAr: editFormData.patientNameAr,
                  rating: editFormData.rating,
                  comment: editFormData.comment,
                  commentAr: editFormData.commentAr,
                  doctorName: editFormData.doctorName,
                  doctorNameAr: editFormData.doctorNameAr,
                  doctorDepartment: editFormData.doctorDepartment,
                  doctorDepartmentAr: editFormData.doctorDepartmentAr,
                  showOnWebsite: editFormData.showOnWebsite
                }
              : fb
          )
        );
      } else {
        const payload: FeedbackPayload = {
          userName: editFormData.patientName,
          arabicUserName: editFormData.patientNameAr,
          feedback: editFormData.comment,
          arabicFeedback: editFormData.commentAr,
          stars: editFormData.rating,
          shownOnWebsite: editFormData.showOnWebsite
        };
        
        await updateHospitalFeedback({
          id: editingFeedback.id,
          data: payload,
        });
        
        // Update local state
        setHospitalFeedbacks(prev =>
          prev.map(fb =>
            fb.id === editingFeedback.id
              ? {
                  ...fb,
                  patientName: editFormData.patientName,
                  patientNameAr: editFormData.patientNameAr,
                  rating: editFormData.rating,
                  comment: editFormData.comment,
                  commentAr: editFormData.commentAr,
                  showOnWebsite: editFormData.showOnWebsite
                }
              : fb
          )
        );
      }
      
      toast.success(showArabicContent ? "تم تحديث الملاحظة بنجاح" : "Feedback updated successfully");
      setEditingFeedback(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error(showArabicContent ? "فشل في تحديث الملاحظة" : "Failed to update feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => interactive && onChange?.(s)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            disabled={!interactive}
          >
            <Star 
              size={interactive ? 28 : 14} 
              className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} 
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string, useArabicLocale = false) => {
    const date = new Date(dateString);
    if (useArabicLocale) {
      return date.toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter doctor feedbacks
  const filteredDoctorFeedbacks = doctorFeedbacks.filter(fb => {
    if (!matchesSelectedLanguage(fb.comment, fb.commentAr)) return false;

    const searchValue = searchTerm.toLowerCase();
    const useArabic = showArabicContent;
    const patientName = pickLocalizedText(fb.patientName, fb.patientNameAr, useArabic).toLowerCase();
    const doctorName = pickLocalizedText(fb.doctorName, fb.doctorNameAr, useArabic).toLowerCase();
    const comment = pickLocalizedText(fb.comment, fb.commentAr, useArabic).toLowerCase();

    const matchesSearch = searchTerm === "" ||
      patientName.includes(searchValue) ||
      doctorName.includes(searchValue) ||
      comment.includes(searchValue);
    const matchesRating = ratingFilter === "all" || fb.rating === ratingFilter;
    const matchesWebsite = websiteFilter === "all" ||
      (websiteFilter === "shown" && fb.showOnWebsite) ||
      (websiteFilter === "hidden" && !fb.showOnWebsite);
    const matchesAdmin = adminFilter === "all" ||
      (adminFilter === "admin" && fb.addedByAdmin) ||
      (adminFilter === "user" && !fb.addedByAdmin);
    return matchesSearch && matchesRating && matchesWebsite && matchesAdmin;
  });

  // Filter hospital feedbacks
  const filteredHospitalFeedbacks = hospitalFeedbacks.filter(fb => {
    if (!matchesSelectedLanguage(fb.comment, fb.commentAr)) return false;

    const searchValue = searchTerm.toLowerCase();
    const useArabic = showArabicContent;
    const patientName = pickLocalizedText(fb.patientName, fb.patientNameAr, useArabic).toLowerCase();
    const comment = pickLocalizedText(fb.comment, fb.commentAr, useArabic).toLowerCase();

    const matchesSearch = searchTerm === "" ||
      patientName.includes(searchValue) ||
      comment.includes(searchValue);
    const matchesRating = ratingFilter === "all" || fb.rating === ratingFilter;
    const matchesWebsite = websiteFilter === "all" ||
      (websiteFilter === "shown" && fb.showOnWebsite) ||
      (websiteFilter === "hidden" && !fb.showOnWebsite);
    const matchesAdmin = adminFilter === "all" ||
      (adminFilter === "admin" && fb.addedByAdmin) ||
      (adminFilter === "user" && !fb.addedByAdmin);
    return matchesSearch && matchesRating && matchesWebsite && matchesAdmin;
  });

  // Pagination logic
  const getPaginatedItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = (totalPages: number) => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pageNumbers;
  };

  const currentDoctorItems = getPaginatedItems(filteredDoctorFeedbacks);
  const currentHospitalItems = getPaginatedItems(filteredHospitalFeedbacks);
  const doctorTotalPages = getTotalPages(filteredDoctorFeedbacks.length);
  const hospitalTotalPages = getTotalPages(filteredHospitalFeedbacks.length);

  // UI Text
  const uiText = {
    doctorFeedback: "Doctor Feedback",
    hospitalFeedback: "Hospital Feedback",
    searchPlaceholder: "Search by patient name or keyword...",
    allRatings: "All Ratings",
    allFeedback: "All Feedback",
    shown: "Shown on Website",
    hiddenText: "Hidden from Website",
    clear: "Clear",
    patientFeedback: "Patient Feedback",
    noDoctorFeedback: "No doctor feedback found",
    noHospitalFeedback: "No hospital feedback found",
    adjustFilters: "Try adjusting your search or filters",
    previous: "Previous",
    next: "Next",
    addFeedback: "Add Feedback",
    allFeedbackSource: "All Feedback",
    adminAdded: "Added by Admin",
    userAdded: "User Feedback",
    addedByAdminBadge: "Added by Admin",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save Changes",
    editFeedback: "Edit Feedback"
  };

  const editingArabicOnly = editingFeedback
    ? isArabicOnlyFeedback(editingFeedback.comment, editingFeedback.commentAr)
    : false;
  const editingEnglishOnly = editingFeedback
    ? isEnglishOnlyFeedback(editingFeedback.comment, editingFeedback.commentAr)
    : false;

  if (loading) {
    return (
      <AdminLayout title="Feedback & Reviews">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Feedback & Reviews">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
            <button
              onClick={() => {
                setShowArabicContent(false);
                setCurrentPage(1);
              }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${!showArabicContent
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }
              `}
            >
              <Globe className="h-3.5 w-3.5" />
              English
            </button>
            <button
              onClick={() => {
                setShowArabicContent(true);
                setCurrentPage(1);
              }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${showArabicContent
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }
              `}
            >
              <Languages className="h-3.5 w-3.5" />
              العربية
            </button>
          </div>

          <Button onClick={() => navigate("/add-feedback")} className="gap-2">
            <Plus className="h-4 w-4" />
            {uiText.addFeedback}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-xl w-fit">
          <button
            onClick={() => { setActiveTab("doctor"); setCurrentPage(1); }}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === "doctor"
                ? "bg-white text-burgundy shadow-md"
                : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }
            `}
          >
            <User className="h-4 w-4" />
            {uiText.doctorFeedback}
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 rounded-full">{doctorFeedbacks.length}</span>
          </button>
          <button
            onClick={() => { setActiveTab("hospital"); setCurrentPage(1); }}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === "hospital"
                ? "bg-white text-burgundy shadow-md"
                : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }
            `}
          >
            <Building2 className="h-4 w-4" />
            {uiText.hospitalFeedback}
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-100 rounded-full">{hospitalFeedbacks.length}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={uiText.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              dir="ltr"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value)); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
          >
            <option value="all">{uiText.allRatings}</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={websiteFilter}
            onChange={(e) => { setWebsiteFilter(e.target.value as "all" | "shown" | "hidden"); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
          >
            <option value="all">{uiText.allFeedback}</option>
            <option value="shown">{uiText.shown}</option>
            <option value="hidden">{uiText.hiddenText}</option>
          </select>
          <select
            value={adminFilter}
            onChange={(e) => { setAdminFilter(e.target.value as "all" | "admin" | "user"); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
          >
            <option value="all">{uiText.allFeedbackSource}</option>
            <option value="admin">{uiText.adminAdded}</option>
            <option value="user">{uiText.userAdded}</option>
          </select>
          {(searchTerm || ratingFilter !== "all" || websiteFilter !== "all" || adminFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setRatingFilter("all");
                setWebsiteFilter("all");
                setAdminFilter("all");
                setCurrentPage(1);
              }}
              className="gap-1 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              {uiText.clear}
            </Button>
          )}
        </div>

        {/* Doctor Feedback Section */}
        {activeTab === "doctor" && (
          <div className="space-y-4">
            {currentDoctorItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">{uiText.noDoctorFeedback}</p>
                <p className="text-sm text-slate-400 mt-1">{uiText.adjustFilters}</p>
              </div>
            ) : (
              <>
                {currentDoctorItems.map((fb) => {
                  const useArabic = showArabicContent;
                  return (
                  <div key={fb.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/5 flex items-center justify-center border-2 border-burgundy/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-burgundy font-bold text-base">{fb.doctorInitials || getInitials(pickLocalizedText(fb.doctorName, fb.doctorNameAr, useArabic))}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-semibold text-slate-800 text-lg ${useArabic ? "rtl-text" : ""}`}>
                                {pickLocalizedText(fb.doctorName, fb.doctorNameAr, useArabic)}
                              </p>
                              {/* Added by Admin Capsule */}
                              {fb.addedByAdmin && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                  <Shield className="h-3 w-3" />
                                  {uiText.addedByAdminBadge}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs text-slate-500 ${useArabic ? "rtl-text" : ""}`}>
                              {pickLocalizedText(fb.doctorDepartment, fb.doctorDepartmentAr, useArabic)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {renderStars(fb.rating)}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleShowOnWebsite(fb.id, "doctor")}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${fb.showOnWebsite
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                              {fb.showOnWebsite ? (
                                <>
                                  <Eye className="h-3 w-3" />
                                  {uiText.shown}
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  {uiText.hiddenText}
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(fb, "doctor")}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(fb.id, "doctor")}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className={`text-xs text-slate-600 ${useArabic ? "rtl-text" : ""}`}>
                              {pickLocalizedText(fb.patientName, fb.patientNameAr, useArabic)}
                            </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-600">{formatDate(fb.date, useArabic)}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 relative">
                          <Quote className="absolute -top-2 -left-2 h-5 w-5 text-burgundy/20" />
                          <p className={`text-sm text-slate-600 leading-relaxed pl-3 ${useArabic ? "rtl-text" : ""}`}>
                            {pickLocalizedText(fb.comment, fb.commentAr, useArabic)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}

                {/* Pagination for Doctor Feedback */}
                {doctorTotalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers(doctorTotalPages).map((page, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => typeof page === "number" && handlePageChange(page)}
                          disabled={page === "..."}
                          className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${currentPage === page
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= doctorTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Hospital Feedback Section */}
        {activeTab === "hospital" && (
          <div className="space-y-4">
            {currentHospitalItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">{uiText.noHospitalFeedback}</p>
                <p className="text-sm text-slate-400 mt-1">{uiText.adjustFilters}</p>
              </div>
            ) : (
              <>
                {currentHospitalItems.map((fb) => {
                  const useArabic = showArabicContent;
                  return (
                  <div key={fb.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/5 flex items-center justify-center border-2 border-burgundy/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-burgundy font-bold text-base">{getInitials(pickLocalizedText(fb.patientName, fb.patientNameAr, useArabic))}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-semibold text-slate-800 text-lg ${useArabic ? "rtl-text" : ""}`}>
                                {pickLocalizedText(fb.patientName, fb.patientNameAr, useArabic)}
                              </p>
                              {/* Added by Admin Capsule */}
                              {fb.addedByAdmin && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                  <Shield className="h-3 w-3" />
                                  {uiText.addedByAdminBadge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{uiText.patientFeedback}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {renderStars(fb.rating)}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleShowOnWebsite(fb.id, "hospital")}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${fb.showOnWebsite
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                              {fb.showOnWebsite ? (
                                <>
                                  <Eye className="h-3 w-3" />
                                  {uiText.shown}
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  {uiText.hiddenText}
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(fb, "hospital")}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(fb.id, "hospital")}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-600">{formatDate(fb.date, useArabic)}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 relative">
                          <Quote className="absolute -top-2 -left-2 h-5 w-5 text-burgundy/20" />
                          <p className={`text-sm text-slate-600 leading-relaxed pl-3 ${useArabic ? "rtl-text" : ""}`}>
                            {pickLocalizedText(fb.comment, fb.commentAr, useArabic)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}

                {/* Pagination for Hospital Feedback */}
                {hospitalTotalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers(hospitalTotalPages).map((page, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => typeof page === "number" && handlePageChange(page)}
                          disabled={page === "..."}
                          className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${currentPage === page
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= hospitalTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditingFeedback(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-burgundy/5 to-white border-b border-slate-100 p-5 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <Edit className="h-5 w-5 text-burgundy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{uiText.editFeedback}</h3>
                    <p className="text-xs text-slate-500">Update feedback details</p>
                  </div>
                </div>
                <button onClick={() => setEditingFeedback(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                {renderStars(editFormData.rating, true, (rating) => setEditFormData({ ...editFormData, rating }))}
              </div>

              {/* Patient Name */}
              {!editingArabicOnly && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name (English)</label>
                <input
                  type="text"
                  value={editFormData.patientName}
                  onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  placeholder="Enter patient name in English"
                />
              </div>
              )}

              {!editingEnglishOnly && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name (Arabic)</label>
                <input
                  type="text"
                  value={editFormData.patientNameAr}
                  onChange={(e) => setEditFormData({ ...editFormData, patientNameAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  dir="rtl"
                  placeholder="أدخل اسم المريض بالعربية"
                />
              </div>
              )}

              {/* Doctor specific fields */}
              {activeTab === "doctor" && (
              <>
                {!editingArabicOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Name (English)</label>
                  <input
                    type="text"
                    value={editFormData.doctorName}
                    onChange={(e) => setEditFormData({ ...editFormData, doctorName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    placeholder="Enter doctor name in English"
                  />
                </div>
                )}

                {!editingEnglishOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Name (Arabic)</label>
                  <input
                    type="text"
                    value={editFormData.doctorNameAr}
                    onChange={(e) => setEditFormData({ ...editFormData, doctorNameAr: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    dir="rtl"
                    placeholder="أدخل اسم الطبيب بالعربية"
                  />
                </div>
                )}

                {!editingArabicOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department (English)</label>
                  <input
                    type="text"
                    value={editFormData.doctorDepartment}
                    onChange={(e) => setEditFormData({ ...editFormData, doctorDepartment: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    placeholder="Enter department in English"
                  />
                </div>
                )}

                {!editingEnglishOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department (Arabic)</label>
                  <input
                    type="text"
                    value={editFormData.doctorDepartmentAr}
                    onChange={(e) => setEditFormData({ ...editFormData, doctorDepartmentAr: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    dir="rtl"
                    placeholder="أدخل القسم بالعربية"
                  />
                </div>
                )}
              </>
              )}

              {/* Feedback Comments */}
              {!editingArabicOnly && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Feedback (English)</label>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
                  placeholder="Enter feedback in English"
                />
              </div>
              )}

              {!editingEnglishOnly && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Feedback (Arabic)</label>
                <textarea
                  value={editFormData.commentAr}
                  onChange={(e) => setEditFormData({ ...editFormData, commentAr: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
                  dir="rtl"
                  placeholder="أدخل الملاحظة بالعربية"
                />
              </div>
              )}

              {/* Show on Website Toggle */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-slate-700">Show on Website</label>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, showOnWebsite: !editFormData.showOnWebsite })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy/20 ${editFormData.showOnWebsite ? "bg-green-600" : "bg-slate-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editFormData.showOnWebsite ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setEditingFeedback(null)} className="flex-1">
                  {uiText.cancel}
                </Button>
                <Button onClick={saveEdit} disabled={isSubmitting} className="flex-1 gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {uiText.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RTL Styles */}
      <style>{`
        .rtl-text {
          direction: rtl;
          text-align: right;
        }
      `}</style>
    </AdminLayout>
  );
};

export default FeedbackReviews;