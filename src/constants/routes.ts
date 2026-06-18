/** Application route paths — keep in sync with App.tsx route definitions. */
export const ROUTES = {
  dashboard: "/",
  reservation: "/reservation",
} as const

/** Human-readable labels used in breadcrumbs and page titles. */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.reservation]: "Reservations",
}

export function getRouteLabel(pathname: string) {
  return ROUTE_LABELS[pathname] ?? "Dashboard"
}

/** Maps the current URL to the sidebar nav item id for active styling. */
export function getActiveNavId(pathname: string) {
  if (pathname === ROUTES.reservation) return "reservation"
  if (pathname === ROUTES.dashboard) return "dashboard"
  return "dashboard"
}
