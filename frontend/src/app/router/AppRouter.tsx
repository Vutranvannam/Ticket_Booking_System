import { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { Spinner } from "@/shared/components/atoms/Spinner";
import { authRoutes }      from "./AuthRoutes";
import { homeRouter }      from "./HomeRouter";
import { userRouter }      from "./UserRouter";

const fallback = (
  <div className="flex h-screen items-center justify-center">
    <Spinner size="lg" className="text-indigo-500" />
  </div>
);

export default function AppRouter() {
  const routes = useRoutes([
    ...authRoutes,
    ...homeRouter,
    ...userRouter,
    { path: "*",   element: <Navigate to="/" replace /> },
  ]);

  return <Suspense fallback={fallback}>{routes}</Suspense>;
}
