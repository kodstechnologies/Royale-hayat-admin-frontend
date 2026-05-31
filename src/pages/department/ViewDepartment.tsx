import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Calendar, FolderOpen, CheckCircle, XCircle, Image as ImageIcon, Globe, Languages } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { adminDepartments, AdminDepartment } from "@/data/departments";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  customExplainantions?: any[];
};

// Function to load departments from localStorage (user created)
const loadUserDepartments = () => {
  const stored = localStorage.getItem("rhh_departments");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Function to get category name from ID
const getCategoryNameFromId = (categoryId: string): string => {
  const categoryMap: Record<string, string> = {
    cat1: "Cardiology",
    cat2: "Neurology",
    cat3: "Pediatrics",
    cat4: "Orthopedics",
    cat5: "Dermatology",
  };
  return categoryMap[categoryId] || "Clinical Speciality";
};

// Function to get category display name
const getCategoryDisplayNameForDept = (category: string, isArabic: boolean) => {
  const categoryMap: Record<string, { en: string; ar: string }> = {
    "Clinical Speciality": { en: "Clinical Speciality", ar: "التخصصات السريرية" },
    "Clinical Support Service": { en: "Clinical Support Service", ar: "خدمات الدعم السريري" },
    "Home Care Service": { en: "Home Care Service", ar: "خدمات الرعاية المنزلية" },
    "Cardiology": { en: "Cardiology", ar: "أمراض القلب" },
    "Neurology": { en: "Neurology", ar: "الأعصاب" },
    "Pediatrics": { en: "Pediatrics", ar: "طب الأطفال" },
    "Orthopedics": { en: "Orthopedics", ar: "جراحة العظام" },
    "Dermatology": { en: "Dermatology", ar: "الأمراض الجلدية" },
  };
  return categoryMap[category]?.[isArabic ? "ar" : "en"] || category;
};

const ViewDepartment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    // Simulate loading delay
    setTimeout(() => {
      // First check if this is a user-created department from localStorage
      const userDepartments = loadUserDepartments();
      let foundDept = userDepartments.find((dept: any) => dept._id === id);
      
      // If not found in user departments, check static data
      if (!foundDept) {
        foundDept = adminDepartments.find(dept => dept.id === id);
      }
      
      if (foundDept) {
        // Check if this is a user department (has catagoryId) or static department
        if (foundDept.catagoryId) {
          // This is a user-created department
          const selectedCategory = getCategoryNameFromId(foundDept.catagoryId);
          setDepartment({
            _id: foundDept._id,
            departmentId: foundDept.departmentId,
            name: foundDept.name,
            nameAr: foundDept.arabicName || foundDept.name,
            description: foundDept.description,
            descriptionAr: foundDept.arabicDescription || foundDept.description,
            image: foundDept.image,
            category: selectedCategory,
            createdAt: foundDept.createdAt || new Date().toISOString(),
            updatedAt: foundDept.updatedAt || new Date().toISOString(),
            isActive: foundDept.isActive !== undefined ? foundDept.isActive : true,
            customExplainantions: foundDept.customExplainantions || [],
          });
        } else {
          // This is a static department from adminDepartments
          setDepartment({
            _id: foundDept.id,
            departmentId: foundDept.clinicalCode || foundDept.id,
            name: foundDept.name,
            nameAr: foundDept.nameAr,
            description: foundDept.description,
            descriptionAr: foundDept.descriptionAr,
            image: foundDept.image,
            category: foundDept.category,
            createdAt: foundDept.createdAt,
            updatedAt: foundDept.updatedAt,
            isActive: true,
          });
        }
      } else {
        setError("Department not found.");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    return getCategoryDisplayNameForDept(category, activeLanguage === "arabic");
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Clinical Speciality":
        return "bg-blue-100 text-blue-700";
      case "Clinical Support Service":
        return "bg-green-100 text-green-700";
      case "Home Care Service":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout title="View Department">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-4 sm:p-6">
            {/* Header with Navigation */}
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <button
                  onClick={() => navigate("/departments")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Department Details</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">View department information</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Language Toggle */}
                <div className="flex w-full sm:w-auto gap-2 p-1 bg-slate-100/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("english")}
                    className={`
                      flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${activeLanguage === "english"
                        ? "bg-white text-burgundy shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("arabic")}
                    className={`
                      flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${activeLanguage === "arabic"
                        ? "bg-white text-burgundy shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Languages className="h-3.5 w-3.5" />
                    العربية
                  </button>
                </div>

                {department?._id && (
                  <Button
                    onClick={() => navigate(`/departments/edit/${department._id}`)}
                    className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Department
                  </Button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-12">
                <Loader />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  onClick={() => navigate("/departments")}
                  variant="outline"
                  className="mt-4"
                >
                  Back to Departments
                </Button>
              </div>
            )}

            {/* Department Details */}
            {!loading && !error && department && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Image & Basic Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Image Card */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      {department.image ? (
                        <img 
                          src={department.image} 
                          alt={activeLanguage === "english" ? department.name : department.nameAr} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Info Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {activeLanguage === "english" ? "Department ID" : "معرف القسم"}
                      </label>
                      <p className="text-sm font-mono text-slate-800 mt-1">{department.departmentId || "-"}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {activeLanguage === "english" ? "Status" : "الحالة"}
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          {activeLanguage === "english" ? "Active" : "نشط"}
                        </span>
                      </div>
                    </div>

                    {department.createdAt && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {activeLanguage === "english" ? "Created At" : "تاريخ الإنشاء"}
                        </label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">{formatDate(department.createdAt)}</p>
                        </div>
                      </div>
                    )}

                    {department.updatedAt && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {activeLanguage === "english" ? "Last Updated" : "آخر تحديث"}
                        </label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">{formatDate(department.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Name Card */}
                  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {activeLanguage === "english" ? "Department Name" : "اسم القسم"}
                    </label>
                    <h1 className={`text-xl sm:text-2xl font-bold text-slate-800 mt-1 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                      {activeLanguage === "english" ? department.name : department.nameAr}
                    </h1>
                  </div>

                  {/* Category Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {activeLanguage === "english" ? "Category" : "التصنيف"}
                    </label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getCategoryColor(department.category)}`}>
                        <FolderOpen className="h-3.5 w-3.5" />
                        {getCategoryDisplayName(department.category)}
                      </span>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {activeLanguage === "english" ? "Description" : "الوصف"}
                    </label>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                      {activeLanguage === "english" ? department.description : department.descriptionAr}
                    </p>
                  </div>

                  {/* Custom Sections - Only show if there are custom sections */}
                  {department.customExplainantions && department.customExplainantions.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                        {activeLanguage === "english" ? "Custom Sections" : "أقسام مخصصة"}
                      </label>
                      <div className="space-y-4">
                        {department.customExplainantions.map((section, index) => {
                          const heading = activeLanguage === "english" ? section.subHeading : section.arabicSubHeading;
                          const explanations = activeLanguage === "english" ? section.explaination : section.arabicExplaination;
                          
                          if (!heading && (!explanations || explanations.length === 0)) return null;
                          
                          return (
                            <div key={section.id || index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                              {heading && (
                                <h3 className={`font-semibold text-slate-800 mb-3 ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                                  {heading}
                                </h3>
                              )}
                              {explanations && explanations.length > 0 && (
                                <ul className="space-y-2">
                                  {explanations.map((line: string, li: number) => (
                                    <li key={li} className="flex items-start gap-2 text-sm text-slate-600">
                                      <span className="text-burgundy mt-1">•</span>
                                      <span className={activeLanguage === "arabic" ? "rtl-text" : ""}>{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add RTL styles for Arabic text */}
      <style>{`
        .rtl-text {
          direction: rtl;
          text-align: right;
        }
      `}</style>
    </AdminLayout>
  );
};

export default ViewDepartment;