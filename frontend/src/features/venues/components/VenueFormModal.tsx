import { Modal } from "@/shared/components/molecules/Modal";
import { FormField } from "@/shared/components/molecules/FormField";
import { Input } from "@/shared/components/atoms/Input";
import { Select } from "@/shared/components/atoms/Select";
import { Textarea } from "@/shared/components/atoms/Textarea";
import { Button } from "@/shared/components/atoms/Button";
import { Spinner } from "@/shared/components/atoms/Spinner";
import { useVenueForm } from "../hooks/useVenueForm";
import type { Venue } from "../types/venue.types";

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue?: Venue | null;
  onSuccess: (venue: Venue) => void;
}

export function VenueFormModal({
  isOpen,
  onClose,
  venue,
  onSuccess,
}: VenueFormModalProps) {
  const { form, onSubmit, isSubmitting, error, setError } = useVenueForm({
    initialData: venue,
    onSuccess: (saved: Venue) => {
      onSuccess(saved);
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={venue ? "Cập nhật địa điểm" : "Tạo địa điểm mới"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField label="Tên địa điểm *" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="VD: Trung tâm Hội nghị Quốc gia"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Địa chỉ cụ thể *" error={errors.address?.message}>
              <Input
                {...register("address")}
                placeholder="VD: Số 57 Phạm Hùng, Mễ Trì, Nam Từ Liêm"
              />
            </FormField>
          </div>

          <FormField label="Thành phố *" error={errors.city?.message}>
            <Input {...register("city")} placeholder="VD: Hà Nội" />
          </FormField>

          <FormField label="Tỉnh / Bang" error={errors.state?.message}>
            <Input {...register("state")} placeholder="VD: Hà Nội" />
          </FormField>

          <FormField label="Quốc gia *" error={errors.country?.message}>
            <Input {...register("country")} placeholder="VD: Vietnam" />
          </FormField>

          <FormField label="Mã bưu chính" error={errors.zipCode?.message}>
            <Input {...register("zipCode")} placeholder="VD: 100000" />
          </FormField>

          <FormField label="Số điện thoại" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="VD: 0987654321" />
          </FormField>

          <FormField label="Email liên hệ" error={errors.email?.message}>
            <Input
              type="email"
              {...register("email")}
              placeholder="VD: contact@venue.vn"
            />
          </FormField>

          <FormField label="Phạm vi hiển thị *" error={errors.visibility?.message}>
            <Select
              {...register("visibility")}
              options={[
                { value: "PUBLIC", label: "PUBLIC (Công khai trong thư viện)" },
                { value: "PRIVATE", label: "PRIVATE (Chỉ người tạo và Admin)" },
              ]}
            />
          </FormField>
        </div>

        <FormField label="Mô tả" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="Mô tả cơ sở vật chất, vị trí, tiện ích..."
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" /> Đang lưu...
              </>
            ) : venue ? (
              "Lưu thay đổi"
            ) : (
              "Tạo địa điểm"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
