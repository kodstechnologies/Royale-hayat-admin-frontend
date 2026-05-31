import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, FileText } from "lucide-react";
import { getInitials } from "./appointmentUtils";

export const DetailSection = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-burgundy" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const InfoRow = ({
  label,
  value,
  icon: Icon,
  fullWidth,
  mono,
}: {
  label: string;
  value?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  mono?: boolean;
}) => {
  if (!value) return null;
  return (
    <div className={fullWidth ? "col-span-full" : undefined}>
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </label>
      <p
        className={`text-sm text-slate-800 mt-1 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
};

export const SummaryChip = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon: LucideIcon;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm min-w-0">
      <div className="w-9 h-9 rounded-lg bg-burgundy/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-burgundy" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
};

export const NotesBlock = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
};

export const ProfileAvatar = ({ name }: { name: string }) => (
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy/20 to-burgundy/5 border border-burgundy/20 flex items-center justify-center shrink-0 shadow-sm">
    <span className="text-burgundy font-bold text-lg">{getInitials(name)}</span>
  </div>
);

export const ViewPageShell = ({
  backLabel,
  onBack,
  title,
  subtitle,
  badge,
  children,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
}) => (
  <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
    <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group mt-0.5"
            title={backLabel}
          >
            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
          </button>
          <ProfileAvatar name={title} />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  </div>
);

export const ViewLoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4" />
      <p className="text-sm text-slate-500">Loading details...</p>
    </div>
  </div>
);

export const ViewNotFoundState = ({
  message,
  backLabel,
  onBack,
}: {
  message: string;
  backLabel: string;
  onBack: () => void;
}) => (
  <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
    <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
    <div className="p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <FileText className="h-10 w-10 text-slate-400" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {backLabel}
      </button>
    </div>
  </div>
);
