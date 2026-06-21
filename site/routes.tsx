import type { ReactElement } from "react";
import { HomePage } from "./pages/HomePage";
import { CartogramPage } from "./pages/CartogramPage";
import { ParliamentPage } from "./pages/ParliamentPage";
import { VotesChartPage } from "./pages/VotesChartPage";
import { SeatsChartPage } from "./pages/SeatsChartPage";
import { CompositionBarPage } from "./pages/CompositionBarPage";

export interface RouteDef {
  path: string;
  label: string;
  /** Sidebar grouping heading. Omitted for the overview link. */
  group?: string;
  element: ReactElement;
}

/** Single source of truth for both the router and the sidebar nav. */
export const routes: RouteDef[] = [
  { path: "/", label: "Overview", element: <HomePage /> },
  { path: "/cartogram", label: "Cartogram", group: "Maps", element: <CartogramPage /> },
  {
    path: "/parliament",
    label: "Parliament Arc + Table",
    group: "Composition",
    element: <ParliamentPage />,
  },
  { path: "/charts/votes", label: "Votes Chart", group: "Charts", element: <VotesChartPage /> },
  { path: "/charts/seats", label: "Seats Chart", group: "Charts", element: <SeatsChartPage /> },
  {
    path: "/charts/composition",
    label: "Composition Bar",
    group: "Charts",
    element: <CompositionBarPage />,
  },
];
