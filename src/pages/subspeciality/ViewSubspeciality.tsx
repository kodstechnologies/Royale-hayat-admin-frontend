import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Building2,
  FileText,
  Globe,
  Languages,
  ListTree,
  BookOpen,
} from "lucide-react";
import Loader from "@/components/SkeletonLoader";
import {
  getSubspecialityById,
  mapApiSubspecialityToDetail,
  type SubspecialityDetail,
} from "@/api/subspeciality";

const ViewSubspeciality = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subspeciality, setSubspeciality] = useState<SubspecialityDetail | null>(null);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    const loadSubspeciality = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getSubspecialityById(id);
        const body = response.data;
        const raw = body?.data ?? body;

        if (raw && raw._id) {
          setSubspeciality(mapApiSubspecialityToDetail(raw));
        } else {
          setError("Subspeciality not found");
        }
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        console.error("Error loading subspeciality:", err);
        setError(apiErr?.response?.data?.message || "Failed to load subspeciality");
        toast.error(apiErr?.response?.data?.message || "Failed to load subspeciality");
      } finally {
        setLoading(false);
      }
    };

    void loadSubspeciality();
  }, [id]);

  const isArabic = activeLanguage === "arabic";

  const formatDate = (dateString: string) => {
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

  if (loading) {
    return (
      <AdminLayout title="View Subspeciality">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
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
              <p className="text-slate-500 font-medium">Subspeciality not found</p>
              <p className="text-sm text-slate-400 mt-1">
                {error || "The subspeciality you're looking for doesn't exist"}
              </p>
              <Button
                onClick={() => navigate("/subspecialities")}
                className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
              >
                Back to Subspecialities
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Subspeciality">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <button
                  onClick={() => navigate("/subspecialities")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Subspeciality Details
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    View complete subspeciality information
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

                {/* <Button
                  onClick={() => navigate(`/subspecialities/edit/${subspeciality.id}`)}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <Pencil className="h-4 w-4" />
                  {activeLanguage === "english" ? "Edit" : "تعديل"}
                </Button> */}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800 text-left">
                      Subspeciality Name
                    </h3>
                  </div>
                  <h1
                    dir={isArabic ? "rtl" : "ltr"}
                    className={`text-xl font-bold text-slate-800 ${isArabic ? "text-right" : ""}`}
                  >
                    {isArabic ? subspeciality.arabicName : subspeciality.name}
                  </h1>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" dir="ltr">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800 text-left">
                      Timestamps
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 text-left">Created At</span>
                      <span className="text-sm text-slate-700">
                        {formatDate(subspeciality.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 text-left">Last Updated</span>
                      <span className="text-sm text-slate-700">
                        {formatDate(subspeciality.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <Building2 className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800 text-left">
                      Department
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 text-left">
                    {subspeciality.departmentName || "—"}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <BookOpen className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800 text-left">
                      Description
                    </h3>
                  </div>
                  <p
                    dir={isArabic ? "rtl" : "ltr"}
                    className={`text-sm text-slate-700 leading-relaxed whitespace-pre-wrap ${isArabic ? "text-right" : ""}`}
                  >
                    {isArabic ? subspeciality.arabicDescription : subspeciality.description}
                  </p>
                </div>

                {subspeciality.customSubspecialities.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ListTree className="h-5 w-5 text-burgundy" />
                      <h3 className="text-md font-semibold text-slate-800 text-left">
                        Custom Sections
                      </h3>
                    </div>

                    {subspeciality.customSubspecialities.map((section, idx) => {
                      const rawHeading = isArabic
                        ? section.arabicHeading
                        : section.heading;
                      const rawSubHeading = isArabic
                        ? section.arabicSubHeading
                        : section.subHeading;
                      const heading = rawHeading || (!rawHeading && rawSubHeading ? rawSubHeading : "");
                      const subHeading = rawHeading ? rawSubHeading : "";
                      const explanations = isArabic
                        ? section.arabicExplanations
                        : section.explanations;

                      if (
                        !heading &&
                        !subHeading &&
                        (!explanations || explanations.length === 0)
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={section._id || idx}
                          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          {heading && (
                            <>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left mb-1">
                                Heading
                              </span>
                              <h4
                                dir={isArabic ? "rtl" : "ltr"}
                                className={`font-semibold text-slate-800 mb-1 text-md ${isArabic ? "text-right" : ""}`}
                              >
                                {heading}
                              </h4>
                            </>
                          )}
                          {subHeading && (
                            <>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-left mb-1">
                                Subheading
                              </span>
                              <p
                                dir={isArabic ? "rtl" : "ltr"}
                                className={`text-sm font-medium text-slate-700 mb-3 ${isArabic ? "text-right" : ""}`}
                              >
                                {subHeading}
                              </p>
                            </>
                          )}
                          {explanations && explanations.length > 0 && (
                            <ul
                              dir={isArabic ? "rtl" : "ltr"}
                              className={`list-disc list-outside space-y-2 ps-5 text-sm text-slate-600 marker:text-burgundy ${
                                isArabic ? "text-right" : ""
                              }`}
                            >
                              {explanations.map((line, li) => (
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
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => navigate("/subspecialities")}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Subspecialities
                  </Button>
                  {/* <Button
                    onClick={() => navigate(`/subspecialities/edit/${subspeciality.id}`)}
                    className="flex-1 gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Pencil className="h-4 w-4" />
                    {activeLanguage === "english" ? "Edit Subspeciality" : "تعديل التخصص الفرعي"}
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewSubspeciality;
