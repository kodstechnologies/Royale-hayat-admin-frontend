import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Pencil, 
  Building2, 
  FileText, 
  CheckCircle, 
  XCircle,
  Globe,
  Languages,
  ListTree,
  BookOpen
} from "lucide-react";

type CustomSubspeciality = {
  _id: string;
  subHeading: string;
  arabicSubHeading: string;
  explanations: string[];
  arabicExplanations: string[];
};

type Subspeciality = {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  departmentId: string;
  departmentName: string;
  customSubspecialities: CustomSubspeciality[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

// Function to load user subspecialities from localStorage
const loadUserSubspecialities = (): Subspeciality[] => {
  const stored = localStorage.getItem("rhh_subspecialities");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

// Dummy data for existing subspecialities
const dummySubspecialities: Record<string, Subspeciality> = {
  "1": {
    id: "1",
    name: "Interventional Cardiology",
    arabicName: "أمراض القلب التداخلية",
    description: "Specialized in catheter-based treatment of heart diseases",
    arabicDescription: "متخصص في العلاج بالقثطرة لأمراض القلب",
    departmentId: "dept1",
    departmentName: "Cardiology",
    customSubspecialities: [
      {
        _id: "cs1",
        subHeading: "Diagnostic Procedures",
        arabicSubHeading: "الإجراءات التشخيصية",
        explanations: ["Angiography", "Echocardiography", "Stress Test"],
        arabicExplanations: ["تصوير الأوعية", "تخطيط صدى القلب", "اختبار الإجهاد"],
      },
      {
        _id: "cs2",
        subHeading: "Treatment Options",
        arabicSubHeading: "خيارات العلاج",
        explanations: ["Angioplasty", "Stent Placement", "Rotablation"],
        arabicExplanations: ["رأب الأوعية", "تركيب الدعامات", "الاستئصال الدوراني"],
      },
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    isActive: true,
  },
  "2": {
    id: "2",
    name: "Pediatric Cardiology",
    arabicName: "أمراض قلب الأطفال",
    description: "Heart care for infants and children",
    arabicDescription: "رعاية القلب للرضع والأطفال",
    departmentId: "dept1",
    departmentName: "Cardiology",
    customSubspecialities: [
      {
        _id: "cs3",
        subHeading: "Congenital Heart Defects",
        arabicSubHeading: "عيوب القلب الخلقية",
        explanations: ["ASD Closure", "VSD Repair", "Patent Ductus Arteriosus"],
        arabicExplanations: ["إغلاق عيب الحاجز الأذيني", "إصلاح عيب الحاجز البطيني", "القناة الشريانية المفتوحة"],
      },
    ],
    createdAt: "2024-01-16T11:30:00Z",
    updatedAt: "2024-01-16T11:30:00Z",
    isActive: true,
  },
};

const ViewSubspeciality = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [subspeciality, setSubspeciality] = useState<Subspeciality | null>(null);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    setTimeout(() => {
      // First check user subspecialities from localStorage
      const userSubs = loadUserSubspecialities();
      let foundSub = userSubs.find((sub: any) => sub.id === id);
      
      // If not found in user subs, check dummy data
      if (!foundSub) {
        foundSub = dummySubspecialities[id];
      }
      
      if (foundSub) {
        setSubspeciality(foundSub);
      } else {
        setError("Subspeciality not found");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (activeLanguage === "arabic") {
      return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3.5 w-3.5" />
        {activeLanguage === "english" ? "Active" : "نشط"}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="h-3.5 w-3.5" />
        {activeLanguage === "english" ? "Inactive" : "غير نشط"}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="View Subspeciality">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !subspeciality) {
    return (
      <AdminLayout title="View Subspeciality">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            <div className="p-6 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <ListTree className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {activeLanguage === "english" ? "Subspeciality not found" : "لم يتم العثور على التخصص الفرعي"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {activeLanguage === "english" 
                  ? "The subspeciality you're looking for doesn't exist" 
                  : "التخصص الفرعي الذي تبحث عنه غير موجود"}
              </p>
              <Button
                onClick={() => navigate("/subspecialities")}
                className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
              >
                {activeLanguage === "english" ? "Back to Subspecialities" : "العودة إلى التخصصات الفرعية"}
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Subspeciality">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Back Button and Language Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/subspecialities")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeLanguage === "english" ? "Subspeciality Details" : "تفاصيل التخصص الفرعي"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeLanguage === "english" 
                      ? "View complete subspeciality information" 
                      : "عرض معلومات التخصص الفرعي الكاملة"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {/* Language Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
                  <button
                    onClick={() => setActiveLanguage("english")}
                    className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
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
                    onClick={() => setActiveLanguage("arabic")}
                    className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
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

                <Button
                  onClick={() => navigate(`/subspecialities/edit/${subspeciality.id}`)}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Pencil className="h-4 w-4" />
                  {activeLanguage === "english" ? "Edit" : "تعديل"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1 space-y-4">
                {/* Name Card */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      {activeLanguage === "english" ? "Subspeciality Name" : "اسم التخصص الفرعي"}
                    </h3>
                  </div>
                  <h1 className={`text-xl font-bold text-slate-800 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                    {activeLanguage === "english" ? subspeciality.name : subspeciality.arabicName}
                  </h1>
                </div>

                {/* Status Card */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      {activeLanguage === "english" ? "Status Information" : "معلومات الحالة"}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeLanguage === "english" ? "Status" : "الحالة"}
                      </span>
                      {getStatusBadge(subspeciality.isActive)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeLanguage === "english" ? "Created At" : "تاريخ الإنشاء"}
                      </span>
                      <span className="text-sm text-slate-700">{formatDate(subspeciality.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeLanguage === "english" ? "Last Updated" : "آخر تحديث"}
                      </span>
                      <span className="text-sm text-slate-700">{formatDate(subspeciality.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Department Card */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <Building2 className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      {activeLanguage === "english" ? "Department" : "القسم"}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700">{subspeciality.departmentName}</p>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Description Card */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <BookOpen className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      {activeLanguage === "english" ? "Description" : "الوصف"}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {activeLanguage === "english" ? subspeciality.description : subspeciality.arabicDescription}
                  </p>
                </div>

                {/* Custom Sections */}
                {subspeciality.customSubspecialities && subspeciality.customSubspecialities.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ListTree className="h-5 w-5 text-burgundy" />
                      <h3 className="text-md font-semibold text-slate-800">
                        {activeLanguage === "english" ? "Custom Sections" : "الأقسام المخصصة"}
                      </h3>
                    </div>
                    
                    {subspeciality.customSubspecialities.map((section, idx) => {
                      const heading = activeLanguage === "english" ? section.subHeading : section.arabicSubHeading;
                      const explanations = activeLanguage === "english" ? section.explanations : section.arabicExplanations;
                      
                      if (!heading && (!explanations || explanations.length === 0)) return null;
                      
                      return (
                        <div key={section._id || idx} className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                          {heading && (
                            <h4 className="font-semibold text-slate-800 mb-3 text-md">
                              {heading}
                            </h4>
                          )}
                          {explanations && explanations.length > 0 && (
                            <ul className="space-y-2">
                              {explanations.map((line, li) => (
                                <li key={li} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="text-burgundy mt-1">•</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => navigate("/subspecialities")}
                    variant="outline"
                    className="flex-1"
                  >
                    {activeLanguage === "english" ? "Back to Subspecialities" : "العودة إلى التخصصات الفرعية"}
                  </Button>
                  <Button 
                    onClick={() => navigate(`/subspecialities/edit/${subspeciality.id}`)}
                    className="flex-1 gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Pencil className="h-4 w-4" />
                    {activeLanguage === "english" ? "Edit Subspeciality" : "تعديل التخصص الفرعي"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ViewSubspeciality;