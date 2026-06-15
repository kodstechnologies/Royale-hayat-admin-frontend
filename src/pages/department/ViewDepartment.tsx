import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FolderOpen,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Globe,
  Languages,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getDepartmentById,
  mapApiDepartmentToDetail,
  type DepartmentDetail,
} from "@/api/department";

const getCategoryDisplayNameForDept = (category: string, isArabic: boolean) => {
  const categoryMap: Record<string, { en: string; ar: string }> = {
    "Clinical Speciality": {
      en: "Clinical Speciality",
      ar: "التخصصات السريرية",
    },
    "Clinical Support Service": {
      en: "Clinical Support Service",
      ar: "خدمات الدعم السريري",
    },
    "Home Care Service": {
      en: "Home Care Service",
      ar: "خدمات الرعاية المنزلية",
    },
  };
  return categoryMap[category]?.[isArabic ? "ar" : "en"] || category;
};

const ViewDepartment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    const loadDepartment = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDepartmentById(id);
        const body = response.data;
        const raw = body?.data ?? body;

        if (raw && raw._id) {
          setDepartment(mapApiDepartmentToDetail(raw));
        } else {
          setError("Department not found.");
        }
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        console.error("Error loading department:", err);
        setError(apiErr?.response?.data?.message || "Failed to load department.");
        toast.error(apiErr?.response?.data?.message || "Failed to load department");
      } finally {
        setLoading(false);
      }
    };

    void loadDepartment();
  }, [id]);

  const isArabic = activeLanguage === "arabic";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCategoryDisplayName = (category: string) => {
    return getCategoryDisplayNameForDept(category, false);
  };

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

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <button
                  onClick={() => navigate("/departments")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Department Details
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    View department information
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex w-full sm:w-auto gap-2 p-1 bg-slate-100/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("english")}
                    className={`
                      flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${
                        activeLanguage === "english"
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
                      ${
                        activeLanguage === "arabic"
                          ? "bg-white text-burgundy shadow-sm"
                          : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Languages className="h-3.5 w-3.5" />
                    العربية
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="py-12">
                <Loader />
              </div>
            )}

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

            {!loading && !error && department && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      {department.image ? (
                        <img
                          src={department.image}
                          alt={isArabic ? department.nameAr : department.name}
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

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" dir="ltr">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                        Department ID
                      </label>
                      <p className="text-sm font-mono text-slate-800 mt-1">
                        {department.departmentId || "-"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                        Status
                      </label>
                      <div className="mt-1">
                        {department.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {department.createdAt && (
                      <div dir="ltr">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                          Created At
                        </label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {formatDate(department.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {department.updatedAt && (
                      <div dir="ltr">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                          Last Updated
                        </label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {formatDate(department.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                      Department Name
                    </label>
                    <h1
                      dir={isArabic ? "rtl" : "ltr"}
                      className={`text-xl sm:text-2xl font-bold text-slate-800 mt-1 ${isArabic ? "text-right" : ""}`}
                    >
                      {isArabic ? department.nameAr : department.name}
                    </h1>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                      Category
                    </label>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getCategoryColor(department.category)}`}
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        {getCategoryDisplayName(department.category)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                      Description
                    </label>
                    <p
                      dir={isArabic ? "rtl" : "ltr"}
                      className={`text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed ${isArabic ? "text-right" : ""}`}
                    >
                      {isArabic ? department.descriptionAr : department.description}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                      Medical Field
                    </label>
                    <p
                      dir={isArabic ? "rtl" : "ltr"}
                      className={`text-sm text-slate-700 mt-2 leading-relaxed ${isArabic ? "text-right" : ""}`}
                    >
                      {isArabic
                        ? department.medicalFieldAr || "—"
                        : department.medicalField || "—"}
                    </p>
                  </div>

                  {department.customExplainantions &&
                    department.customExplainantions.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block text-left">
                          Custom Sections
                        </label>
                        <div className="space-y-4">
                          {department.customExplainantions.map((section, index) => {
                            const rawHeading = isArabic
                              ? section.arabicHeading
                              : section.heading;
                            const rawSubHeading = isArabic
                              ? section.arabicSubHeading
                              : section.subHeading;
                            const heading =
                              rawHeading || (!rawHeading && rawSubHeading ? rawSubHeading : "");
                            const subHeading = rawHeading ? rawSubHeading : "";
                            const explanations = isArabic
                              ? section.arabicExplaination
                              : section.explaination;

                            if (
                              !heading &&
                              !subHeading &&
                              (!explanations || explanations.length === 0)
                            ) {
                              return null;
                            }

                            return (
                              <div
                                key={section._id || section.id || index}
                                className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                              >
                                <p className="text-xs font-semibold text-burgundy/80 uppercase tracking-wider mb-3 text-left">
                                  Section {index + 1}
                                </p>
                                {heading && (
                                  <div className="mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                                      Heading
                                    </span>
                                    <h3
                                      dir={isArabic ? "rtl" : "ltr"}
                                      className={`font-semibold text-slate-800 mt-1 ${isArabic ? "text-right" : ""}`}
                                    >
                                      {heading}
                                    </h3>
                                  </div>
                                )}
                                {subHeading && (
                                  <div className="mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left">
                                      Subheading
                                    </span>
                                    <p
                                      dir={isArabic ? "rtl" : "ltr"}
                                      className={`text-sm font-medium text-slate-700 mt-1 ${isArabic ? "text-right" : ""}`}
                                    >
                                      {subHeading}
                                    </p>
                                  </div>
                                )}
                                {explanations && explanations.length > 0 && (
                                  <ul
                                    dir={isArabic ? "rtl" : "ltr"}
                                    className={`list-disc list-outside space-y-2 ps-5 text-sm text-slate-600 marker:text-burgundy ${
                                      isArabic ? "text-right" : ""
                                    }`}
                                  >
                                    {explanations.map((line: string, li: number) => (
                                      <li key={li} className="leading-relaxed">
                                        {line}
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
    </AdminLayout>
  );
};

export default ViewDepartment;
