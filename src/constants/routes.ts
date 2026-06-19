/** Application route paths — keep in sync with App.tsx route definitions. */
export const ROUTES = {
  dashboard: "/",
  reservations: "/reservations",
  checkIn: "/check-in",
  administrator: "/administrator",
  ticketbooth: "/ticketbooth",
  searchCustomer: "/administrator/customers",
  performers: "/administrator/performers",
  marketingFilter: "/administrator/marketing-filter",
  promotions: "/administrator/promotions",
  showTimes: "/administrator/show-times",
  preSalePrivateShow: "/administrator/pre-sale-private-show",
  systemDefaults: "/administrator/system-defaults",
  userAccess: "/administrator/user-access",
  users: "/administrator/users",
  businessContacts: "/ticketbooth/business-contacts",
  commentCards: "/ticketbooth/comment-cards",
  giftCards: "/ticketbooth/gift-cards",
  reports: "/reports",
  transactions: "/transactions",
  myAccount: "/my-account",
  touch: "/my-account/touch",
  ticketDefault: "/my-account/ticket-default",
  changePassword: "/my-account/change-password",
} as const

/** Human-readable labels used in breadcrumbs and page titles. */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.reservations]: "Reservations",
  [ROUTES.checkIn]: "Check In",
  [ROUTES.searchCustomer]: "Search Customer",
  [ROUTES.performers]: "Performers",
  [ROUTES.marketingFilter]: "Marketing Filter",
  [ROUTES.promotions]: "Promotion",
  [ROUTES.showTimes]: "Show Times",
  [ROUTES.preSalePrivateShow]: "Private Pre-sale Setup",
  [ROUTES.systemDefaults]: "System Defaults",
  [ROUTES.userAccess]: "User Access",
  [ROUTES.users]: "User",
  [ROUTES.businessContacts]: "Business Contacts",
  [ROUTES.commentCards]: "Comment Cards",
  [ROUTES.giftCards]: "Gift Cards",
  [ROUTES.reports]: "Reports",
  [ROUTES.transactions]: "Transactions",
  [ROUTES.touch]: "Touch",
  [ROUTES.ticketDefault]: "Ticket Default",
  [ROUTES.changePassword]: "Change Password",
}

export function getRouteLabel(pathname: string) {
  return ROUTE_LABELS[pathname] ?? "Dashboard"
}

/** Maps the current URL to the sidebar nav item id for active styling. */
export function getActiveNavId(pathname: string) {
  if (pathname === ROUTES.reservations) return "reservations"
  if (pathname === ROUTES.checkIn) return "check-in"
  if (pathname === ROUTES.reports) return "reports"
  if (pathname === ROUTES.transactions) return "transactions"
  if (pathname === ROUTES.dashboard) return "dashboard"
  return "dashboard"
}
