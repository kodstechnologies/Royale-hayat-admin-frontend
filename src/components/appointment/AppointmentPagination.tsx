import { ChevronLeft, ChevronRight } from "lucide-react";

export const APPOINTMENT_PAGE_SIZE = 10;

export type AppointmentListMeta = {
  page: number;
  limit: number;
  total: number;
  unviewed?: number;
  pages: number;
};

export const defaultListMeta: AppointmentListMeta = {
  page: 1,
  limit: APPOINTMENT_PAGE_SIZE,
  total: 0,
  pages: 0,
};

export const parseListMeta = (
  meta: Partial<AppointmentListMeta> | undefined,
  fallbackTotal = 0,
): AppointmentListMeta => ({
  page: meta?.page ?? 1,
  limit: meta?.limit ?? APPOINTMENT_PAGE_SIZE,
  total: meta?.total ?? fallbackTotal,
  unviewed: meta?.unviewed,
  pages: meta?.pages ?? (fallbackTotal > 0 ? 1 : 0),
});

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pageNumbers: Array<number | string> = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else if (currentPage <= 3) {
    pageNumbers.push(1, 2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pageNumbers.push(
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pageNumbers.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    );
  }

  return pageNumbers;
};

type AppointmentPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

const AppointmentPagination = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  itemLabel = "entries",
}: AppointmentPaginationProps) => {
  if (totalRecords === 0) return null;

  const start = (currentPage - 1) * APPOINTMENT_PAGE_SIZE + 1;
  const end = Math.min(currentPage * APPOINTMENT_PAGE_SIZE, totalRecords);

  return (
    <div className="px-4 py-3 border-t border-slate-100 space-y-3">
      <div className="text-xs text-slate-400 text-right">
        Showing {start} to {end} of {totalRecords} {itemLabel}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  onClick={() => typeof page === "number" && onPageChange(page)}
                  disabled={page === "..."}
                  className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                    currentPage === page
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
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPagination;
