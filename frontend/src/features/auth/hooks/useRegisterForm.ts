import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schemas";
import { useAuth } from "./useAuth";

export function useRegisterForm() {
  const { register, isLoading, error, dismissError } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", fullName: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterFormData) => {
    dismissError();
    await register(data);
  };

  return { form, onSubmit, errors: form.formState.errors, isLoading, error, step, setStep };
}
