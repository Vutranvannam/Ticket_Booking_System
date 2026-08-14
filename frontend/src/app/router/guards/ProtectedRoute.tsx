import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/store/hook";
import { selectIsAuthenticated, selectUser } from "@/features/auth/store/auth.selectors";

interface ProtectedRouteProps {
  permission?: string;
  children?: ReactNode;
  loginPath?: string;
  unauthorizedPath?: string;
}

export default function ProtectedRoute({
  permission,
  children,
  loginPath = "/login",
  unauthorizedPath = "/dashboard",
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (permission && !user?.permissions?.includes(permission)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
