type TableSkeletonLoaderProps = {
  columns?: number;
  rows?: number;
};

const TableSkeletonLoader = ({ columns = 7, rows = 6 }: TableSkeletonLoaderProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={`header-${index}`} className="px-4 py-3">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-t border-border">
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`} className="px-4 py-3">
                    <div className="h-4 w-full max-w-[120px] bg-muted rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeletonLoader;

