import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schemas/auth.schemas";
import { useAuth } from "./useAuth";

export function useLoginForm() {
  const { login, isLoading, error: authError, dismissError } = useAuth();
  // Separate state for OAuth2 error messages (set from URL ?error=oauth2)
  const [oauth2Error, setOAuth2Error] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setOAuth2Error(null);
    dismissError();
    await login(data);
  };

  return {
    form,
    onSubmit,
    errors: form.formState.errors,
    isLoading,
    // Merge both error sources — auth error takes priority
    error: authError ?? oauth2Error,
    setOAuth2Error,
  };
}
