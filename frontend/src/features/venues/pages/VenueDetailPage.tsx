import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/atoms/Button";
import { Badge } from "@/shared/components/atoms/Badge";
import { Spinner } from "@/shared/components/atoms/Spinner";
import { ConfirmModal } from "@/shared/components/molecules/ConfirmModal";
import { VenueFormModal } from "../components/VenueFormModal";
import { venueService } from "../services/venue.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppPermissions } from "@/core/config/permissions";
import type { Venue } from "../types/venue.types";

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchVenue = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await venueService.getVenueById(id);
      setVenue(data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Không thể tải thông tin địa điểm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, [id]);

  const canUpdate = user?.permissions?.includes(AppPermissions.VENUE_UPDATE);
  const canDelete = user?.permissions?.includes(AppPermissions.VENUE_DELETE);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await venueService.deleteVenue(id);
      navigate("/venues");
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Không thể xóa địa điểm này");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" className="text-primary-600" />
        <p className="text-sm text-text-secondary">Đang tải thông tin địa điểm...</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="space-y-4 max-w-xl mx-auto text-center py-12">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs">
          <Building2 size={48} className="mx-auto text-text-muted mb-3" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Không tìm thấy địa điểm</h2>
          <p className="text-sm text-text-secondary mb-6">
            {error ?? "Địa điểm không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Button variant="default" onClick={() => navigate("/venues")} className="flex items-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button & Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/venues")}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit size={16} /> Chỉnh sửa
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <Trash2 size={16} /> Xóa
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{venue.name}</h1>
              <Badge variant={venue.visibility === "PUBLIC" ? "success" : "secondary"}>
                {venue.visibility}
              </Badge>
              <Badge variant={venue.active ? "default" : "danger"}>
                {venue.active ? "Hoạt động" : "Ngừng hoạt động"}
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin size={16} className="text-primary-600" />
              {venue.address}, {venue.city}{venue.state ? `, ${venue.state}` : ""}, {venue.country}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Thông tin liên hệ & Vị trí</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-text-secondary">
                <Phone size={16} className="text-text-muted" />
                <span>Số điện thoại:</span>
                <span className="font-medium text-text-primary">{venue.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail size={16} className="text-text-muted" />
                <span>Email:</span>
                <span className="font-medium text-text-primary">{venue.email || "Chưa cập nhật"}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Globe size={16} className="text-text-muted" />
                <span>Tọa độ GPS:</span>
                <span className="font-medium text-text-primary">
                  {venue.latitude && venue.longitude
                    ? `${venue.latitude}, ${venue.longitude}`
                    : "Chưa cấu hình"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Calendar size={16} className="text-text-muted" />
                <span>Ngày tạo:</span>
                <span className="font-medium text-text-primary">
                  {new Date(venue.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Mô tả cơ sở vật chất</h3>
            <div className="p-4 rounded-xl bg-surface-2 border border-border text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {venue.description || "Chưa có mô tả chi tiết cho địa điểm này."}
            </div>
          </div>
        </div>
      </div>

      <VenueFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        venue={venue}
        onSuccess={(updated) => {
          setVenue(updated);
        }}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa địa điểm"
        message={`Bạn có chắc chắn muốn xóa địa điểm "${venue.name}" không? Thao tác này sẽ ẩn địa điểm khỏi toàn bộ hệ thống.`}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        isDanger={true}
      />
    </div>
  );
}
