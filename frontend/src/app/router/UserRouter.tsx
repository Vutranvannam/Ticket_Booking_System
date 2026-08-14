import { lazy } from "react";
import MainLayout from "@/shared/components/layout/MainLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import { AppPermissions } from "@/core/config/permissions";

const ProfilePage = lazy(() => import("@/features/users/pages/ProfilePage"));
const UserListPage = lazy(() => import("@/features/users/pages/UserListPage"));
const UserFormPage = lazy(() => import("@/features/users/pages/UserFormPage"));
const ChangePasswordPage = lazy(() => import("@/features/auth/pages/ChangePasswordPage"));

export const userRouter = [
  {
    path: "/profile/change-password",
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/profile", element: <ProfilePage /> },
      {
        path: "/users",
        element: (
          <ProtectedRoute permission={AppPermissions.USER_LIST}>
            <UserListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/:id",
        element: (
          <ProtectedRoute permission={AppPermissions.USER_VIEW}>
            <UserFormPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
