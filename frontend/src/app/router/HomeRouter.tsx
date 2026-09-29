import type { RouteObject } from "react-router-dom";
import MainLayout from "@/shared/components/layout/MainLayout";
import { HomePage } from "@/features/home";
import { VenueMapViewerPage } from "@/features/venues";

export const homeRouter: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "venues",
        element: <VenueMapViewerPage />,
      },
      {
        path: "venues/map",
        element: <VenueMapViewerPage />,
      },
    ],
  },
];
