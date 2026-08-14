import { Loader2, User } from "lucide-react";
import { Avatar } from "@/shared/components/atoms/Avatar";
import { Badge } from "@/shared/components/atoms/Badge";
import { Button } from "@/shared/components/atoms/Button";
import { FormField } from "@/shared/components/molecules/FormField";
import { Input } from "@/shared/components/atoms/Input";
import { useProfile } from "../hooks/useProfile";
import { useUserForm } from "../hooks/useUserForm";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useProfile();
  const { form, onSubmit, isSubmitting, success, error } = useUserForm();

  useEffect(() => {
    if (user) form.reset({ fullName: user.fullName, phone: user.phone ?? "", avatarUrl: user.avatarUrl ?? "" });
  }, [user, form]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">H? so c?a t�i</h1>

      {/* Header card */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 flex items-center gap-5">
        <Avatar src={user.avatarUrl} fallback={user.fullName} size="xl" />
        <div>
          <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.roles.map((r) => <Badge key={r} variant="default">{r}</Badge>)}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><User size={16} />Thông tin cá nhân</h2>

        <FormField id="profile-fullname" label="H? v� t�n" required error={form.formState.errors.fullName?.message}>
          <Input id="profile-fullname" {...form.register("fullName")} error={!!form.formState.errors.fullName} />
        </FormField>

        <FormField id="profile-phone" label="S? di?n tho?i" error={form.formState.errors.phone?.message}>
          <Input id="profile-phone" {...form.register("phone")} placeholder="+84..." />
        </FormField>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-600">C?p nh?t th�nh c�ng!</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Luu thay d?i
        </Button>
      </form>
    </div>
  );
}
