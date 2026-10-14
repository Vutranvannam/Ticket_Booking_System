import { lazy } from "react";
import MainLayout from "@/shared/components/layout/MainLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import { AppPermissions } from "@/core/config/permissions";

const VenueListPage = lazy(() => import("@/features/venues/pages/VenueListPage"));
const VenueDetailPage = lazy(() => import("@/features/venues/pages/VenueDetailPage"));

export const venueRouter = [
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/venues",
        element: (
          <ProtectedRoute permission={AppPermissions.VENUE_LIST}>
            <VenueListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/venues/:id",
        element: (
          <ProtectedRoute permission={AppPermissions.VENUE_VIEW}>
            <VenueDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
