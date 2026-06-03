const TITLE_POSITION_HINT_EN =
  'To list multiple titles or positions, separate each one with two consecutive spaces (for example: "Chief Executive Officer  Board Member"). Each segment will be shown as a separate title on the website.';

const TITLE_POSITION_HINT_AR =
  "لعرض أكثر من مسمى أو منصب، افصل بين كل مسمى بمسافتين متتاليتين (مثال: «الرئيس التنفيذي  عضو مجلس الإدارة»). سيُعرض كل جزء كمسمى منفصل على الموقع.";

type TitlePositionFieldHintsProps = {
  activeTab: "english" | "arabic";
};

export const TitlePositionFieldHints = ({ activeTab }: TitlePositionFieldHintsProps) => {
  const isArabic = activeTab === "arabic";

  return (
    <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2 mt-1.5">
      <p
        className={`text-xs text-slate-600 leading-relaxed ${isArabic ? "text-right" : ""}`}
        dir={isArabic ? "rtl" : "ltr"}
        lang={isArabic ? "ar" : "en"}
      >
        {isArabic ? TITLE_POSITION_HINT_AR : TITLE_POSITION_HINT_EN}
      </p>
    </div>
  );
};
