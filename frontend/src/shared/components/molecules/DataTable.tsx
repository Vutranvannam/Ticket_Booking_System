import { cn } from "@/core/utils/cn";
import { Spinner } from "@/shared/components/atoms/Spinner";
import { Checkbox } from "@/shared/components/atoms/Checkbox";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectChange?: (id: string | number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  className?: string;
}

export function DataTable<T>({
  columns, data, keyExtractor, isLoading,
  emptyMessage = "Không có dữ liệu",
  onRowClick, selectable, selectedIds, onSelectChange, onSelectAll, className,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedIds?.has(keyExtractor(item)));

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allSelected} onChange={(e) => onSelectAll?.(e.target.checked)} />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="py-16 text-center">
                <Spinner size="lg" className="mx-auto text-indigo-500" />
              </td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="py-16 text-center text-sm text-slate-400">
                {emptyMessage}
              </td></tr>
            ) : data.map((item) => {
              const id = keyExtractor(item);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-colors",
                    onRowClick && "cursor-pointer hover:bg-slate-50/80",
                    selectedIds?.has(id) && "bg-indigo-50/40"
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds?.has(id) ?? false} onChange={(e) => onSelectChange?.(id, e.target.checked)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-sm text-slate-700", col.className)}>
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
