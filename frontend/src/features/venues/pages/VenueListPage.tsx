import { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/shared/components/molecules/DataTable";
import { Pagination } from "@/shared/components/molecules/Pagination";
import { Button } from "@/shared/components/atoms/Button";
import { Badge } from "@/shared/components/atoms/Badge";
import { ConfirmModal } from "@/shared/components/molecules/ConfirmModal";
import { useVenueList } from "../hooks/useVenueList";
import { VenueFilterBar } from "../components/VenueFilterBar";
import { VenueFormModal } from "../components/VenueFormModal";
import { venueService } from "../services/venue.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppPermissions } from "@/core/config/permissions";
import type { Venue, VenueSummary, VenueVisibility } from "../types/venue.types";

export default function VenueListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error, params, updateParams, refresh } = useVenueList();

  const [cityInput, setCityInput] = useState("");
  const debouncedCity = useDebounce(cityInput, 400);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync debounced city
  useEffect(() => {
    updateParams({ city: debouncedCity || undefined, page: 0 });
  }, [debouncedCity]);

  const canCreate = user?.permissions?.includes(AppPermissions.VENUE_CREATE);
  const canUpdate = user?.permissions?.includes(AppPermissions.VENUE_UPDATE);
  const canDelete = user?.permissions?.includes(AppPermissions.VENUE_DELETE);

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fullVenue = await venueService.getVenueById(id);
      setEditingVenue(fullVenue);
      setIsModalOpen(true);
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? "Không thể lấy thông tin địa điểm");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setActionError(null);
    try {
      await venueService.deleteVenue(deletingId);
      setDeletingId(null);
      refresh();
    } catch (err: unknown) {
      setActionError((err as { message?: string })?.message ?? "Không thể xóa địa điểm này");
    }
  };

  const columns: Column<VenueSummary>[] = [
    {
      key: "name",
      header: "Tên địa điểm",
      cell: (v) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Building2 size={20} />
          </div>
          <div>
            <p className="font-semibold text-text-primary hover:text-primary-600 transition-colors">
              {v.name}
            </p>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <MapPin size={13} /> {v.city}, {v.country}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "visibility",
      header: "Phạm vi",
      cell: (v) => (
        <Badge variant={v.visibility === "PUBLIC" ? "success" : "secondary"}>
          {v.visibility}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (v) => (
        <Badge variant={v.active ? "default" : "danger"}>
          {v.active ? "Hoạt động" : "Ngừng hoạt động"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      cell: (v) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/venues/${v.id}`)}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </Button>

          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={(e) => handleOpenEdit(v.id, e)}
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => setDeletingId(v.id)}
              title="Xóa địa điểm"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-text-primary">
            <Building2 className="text-primary-600" size={26} /> Quản lý Địa điểm (Venues)
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Danh sách các địa điểm, nhà hát, sân vận động tổ chức sự kiện
          </p>
        </div>

        {canCreate && (
          <Button
            variant="default"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={18} /> Thêm địa điểm mới
          </Button>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-medium">
          {actionError}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      <VenueFilterBar
        city={cityInput}
        visibility={params.visibility}
        onCityChange={(c) => setCityInput(c)}
        onVisibilityChange={(v) => updateParams({ visibility: (v as VenueVisibility) || undefined, page: 0 })}
      />

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(v) => v.id}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy địa điểm nào phù hợp."
        onRowClick={(v) => navigate(`/venues/${v.id}`)}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={params.page ?? 0}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={params.size ?? 10}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(size) => updateParams({ size, page: 0 })}
        />
      )}

      <VenueFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venue={editingVenue}
        onSuccess={() => {
          refresh();
        }}
      />

      <ConfirmModal
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa địa điểm"
        message="Bạn có chắc chắn muốn xóa địa điểm này không? Thao tác này sẽ đánh dấu xóa mềm địa điểm và ẩn khỏi danh sách."
        confirmLabel="Xóa địa điểm"
        cancelLabel="Hủy"
        isDanger={true}
      />
    </div>
  );
}
