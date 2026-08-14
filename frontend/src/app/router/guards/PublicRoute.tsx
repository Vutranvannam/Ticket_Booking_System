import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/store/hook";
import { selectIsAuthenticated } from "@/features/auth/store/auth.selectors";

interface PublicRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ children, redirectTo = "/" }: PublicRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
