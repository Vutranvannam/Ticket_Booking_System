import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileFormData } from "../schemas/user.schemas";
import { userService } from "../services/user.service";
import { useState } from "react";

export function useUserForm() {
  const [isSubmitting, setSubmitting] = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      await userService.updateMe(data);
      setSuccess(true);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "L?i c?p nh?t h? so");
    } finally {
      setSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting, success, error };
}
