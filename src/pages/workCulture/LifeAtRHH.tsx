import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, Calendar, Award, Globe, Languages } from "lucide-react";

const LifeAtRHH = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  const getUIText = {
    pageTitle: activeLanguage === "english" ? "Life at RHH" : "الحياة في آر إتش إتش",
    pageDescription: activeLanguage === "english" 
      ? "Discover the culture and values at Royale Hayat Hospital"
      : "اكتشف الثقافة والقيم في مستشفى رويال حياة",
    backToWorkCulture: activeLanguage === "english" ? "Back to Work Culture" : "رجوع إلى ثقافة العمل",
    lifeAtRHHHeading: activeLanguage === "english" ? "Life at Royale Hayat Hospital" : "الحياة في مستشفى رويال حياة",
    ourBelief: activeLanguage === "english" ? "Our Belief" : "معتقدنا",
    ourMission: activeLanguage === "english" ? "Our Mission" : "مهمتنا",
    ourValues: activeLanguage === "english" ? "Our Values" : "قيمنا",
    happyEmployees: activeLanguage === "english" ? "Happy Employees" : "موظف سعيد",
    yearsOfExcellence: activeLanguage === "english" ? "Years of Excellence" : "سنوات من التميز",
    communityEvents: activeLanguage === "english" ? "Community Events" : "فعاليات مجتمعية",
    english: activeLanguage === "english" ? "English" : "الإنجليزية",
    arabic: activeLanguage === "english" ? "Arabic" : "العربية",
  };

  const lifeAtRHHContent = {
    description: activeLanguage === "english" 
      ? "At Royale Hayat Hospital, we hold a simple belief: people may forget what we said, but they will never forget how we made them feel as patients, family members, or colleagues.\n\nThat belief guides how we care, how we work, and how we treat one another. Every day, our teams deliver safe, modern, quality care with compassion and comfort—because healing is not only about medicine, but about experience.\n\nHere, professionalism meets kindness. Standards meet empathy. And work carries purpose. If this belief resonates with you, you already belong here."
      : "في مستشفى رويال حياة، نحن نتمسك بإيمان بسيط: قد ينسى الناس ما قلناه، لكنهم لن ينسوا أبدًا كيف جعلناهم يشعرون كمرضى أو أفراد عائلة أو زملاء.\n\nهذا الإيمان يوجه كيفية رعايتنا، وكيف نعمل، وكيف نتعامل مع بعضنا البعض. كل يوم، تقدم فرقنا رعاية آمنة وحديثة وعالية الجودة مع الرحمة والراحة - لأن الشفاء لا يتعلق فقط بالطب، بل بالتجربة.\n\nهنا، تلتقي الاحترافية باللطف. تلتقي المعايير بالتعاطف. ويحمل العمل هدفًا. إذا كان هذا الإيمان يتردد صداه معك، فأنت بالفعل تنتمي إلى هنا.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=600&fit=crop",
    stats: [
      { number: "500+", label: getUIText.happyEmployees, icon: Users },
      { number: "50+", label: getUIText.yearsOfExcellence, icon: Award },
      { number: "1000+", label: getUIText.communityEvents, icon: Calendar },
    ]
  };

  return (
    <AdminLayout title="Life at RHH">
      <div className="space-y-6">
        <BreadCrumb />

        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/work-culture")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-burgundy" />
                <h2 className="text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
            </div>
          </div>

          
          <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
            <button
              onClick={() => setActiveLanguage("english")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeLanguage === "english"
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              {getUIText.english}
            </button>
            <button
              onClick={() => setActiveLanguage("arabic")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeLanguage === "arabic"
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              {getUIText.arabic}
            </button>
          </div>
        </div>

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            <div className="space-y-6">
              
              <div className="relative rounded-xl overflow-hidden">
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                  <div className="p-6 md:p-8 text-white">
                    <h3 className="text-2xl md:text-4xl font-bold mb-2">{getUIText.lifeAtRHHHeading}</h3>
                  
                  </div>
                </div>
              </div>

           

              
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
              
                <div className="prose prose-sm max-w-none">
                  {lifeAtRHHContent.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-600 leading-relaxed mb-4 text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

    
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LifeAtRHH;