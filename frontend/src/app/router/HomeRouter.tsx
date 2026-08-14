import type { RouteObject } from "react-router-dom";
import MainLayout from "@/shared/components/layout/MainLayout";
import { HomePage } from "@/features/home";

export const homeRouter: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
];
