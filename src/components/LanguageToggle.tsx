import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="flex items-center rounded-full border border-border bg-section-bg overflow-hidden text-xs font-sans font-medium transition-colors hover:border-gold"
    >
      <span
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-burgundy text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "ar"
            ? "bg-burgundy text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        عربي
      </span>
    </button>
  );
};

export default LanguageToggle;
