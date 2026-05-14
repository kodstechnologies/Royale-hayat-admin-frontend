import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BreadCrumb = () => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Helper to format path segment to title case/readable text
  const formatSegment = (segment: string) => {
    // Check if it's a UUID or number (common in edit/view routes)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(segment))) {
      return t("Details");
    }
    
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav className="flex items-center gap-2 text-sm font-medium" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-muted-foreground hover:text-burgundy transition-all duration-200 hover:translate-y-[-1px]"
          >
            <Home size={14} className={isRTL ? "ml-1.5" : "mr-1.5"} />
            <span className="hidden sm:inline">{t("Home")}</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return (
            <li key={to} className="flex items-center animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <ChevronRight
                size={14}
                className={`text-muted-foreground/30 ${isRTL ? "rotate-180 ml-1" : "mr-1"}`}
              />
              {last ? (
                <span className="text-burgundy font-bold px-2 py-0.5 rounded-lg bg-burgundy/5 border border-burgundy/10 shadow-sm">
                  {t(formatSegment(value))}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-muted-foreground hover:text-burgundy transition-all duration-200 hover:translate-y-[-1px]"
                >
                  {t(formatSegment(value))}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadCrumb;