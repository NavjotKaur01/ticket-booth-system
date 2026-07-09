/** Application route paths - keep in sync with App.tsx route definitions. */
export const ROUTES = {
  dashboard: "/",
  reservations: "/reservations",
  checkIn: "/check-in",
  administrator: "/administrator",
  venueInfo: "/venue/venue-info",
  venueShowTimes: "/venue/venue-show-times",
  foodMenu: "/venue/food-menu",
  venueAds: "/venue/venue-ads",
  venueRotatingAds: "/venue/venue-rotating-ads",
  giftOfLaughter: "/venue/gift-of-laughter",
  venueSocials: "/venue/venue-socials",
  venueSectionDescriptions: "/venue/venue-section-descriptions",
  formEmails: "/venue/form-emails",
  employmentOpenings: "/venue/employment/openings",
  employmentQuestions: "/venue/employment/questions",
  employmentApplicants: "/venue/employment/applicants",
  webpagesText: "/venue/webpages-text",
  freeForms: "/venue/free-forms",
  ticketbooth: "/ticketbooth",
  calendar: "/calendar",
  searchCustomer: "/administrator/customers",
  performers: "/administrator/performers",
  marketingFilter: "/administrator/marketing-filter",
  promotions: "/administrator/promotions",
  showTimes: "/administrator/show-times",
  preSalePrivateShow: "/administrator/pre-sale-private-show",
  systemDefaults: "/administrator/system-defaults",
  userAccess: "/administrator/user-access",
  users: "/administrator/users",
  webServers: "/administrator/web-servers",
  domains: "/administrator/domains",
  locations: "/administrator/locations",
  domainConfiguration: "/administrator/domain-configuration",
  venueGateway: "/administrator/venue-gateway",
  reservationDefaults: "/administrator/reservation-defaults",
  onlineSettings: "/administrator/online-settings",
  clubReservationSettings: "/administrator/club-reservation-settings",
  createUser: "/administrator/create-user",
  modifyUser: "/administrator/modify-user",
  addUserToLocations: "/administrator/add-user-to-locations",
  navigationManagement: "/administrator/navigation-management",
  navigationDropDowns: "/administrator/navigation-drop-downs",
  navigationRoles: "/administrator/navigation-roles",
  navigationLocation: "/administrator/navigation-location",
  news: "/administrator/news",
  roles: "/administrator/roles",
  comicManager: "/administrator/comic-manager",
  logInManagement: "/administrator/log-in-management",
  transactionLogViewer: "/administrator/transaction-log-viewer",
  featuresAndTips: "/administrator/features-and-tips",
  sumContactLeads: "/administrator/sum-contact-leads",
  events: "/administrator/events",
  businessContacts: "/ticketbooth/business-contacts",
  commentCards: "/ticketbooth/comment-cards",
  giftCards: "/ticketbooth/gift-cards",
  giftCertificate: "/ticketbooth/gift-certificate",
  reports: "/reports",
  transactions: "/transactions",
  myAccount: "/my-account",
  ticketDefault: "/my-account/ticket-default",
  changePassword: "/my-account/change-password",
  login: "/login",
} as const

/** When multiple nav items share a route, only this id is highlighted as active. */
export const ROUTE_PREFERRED_NAV_ITEM_IDS: Partial<Record<string, string>> = {
  [ROUTES.performers]: "comedians",
  [ROUTES.systemDefaults]: "system-defaults",
  [ROUTES.userAccess]: "user-access",
  [ROUTES.users]: "user",
  [ROUTES.webServers]: "web-servers",
  [ROUTES.domains]: "domains",
  [ROUTES.locations]: "locations",
  [ROUTES.domainConfiguration]: "domain-configuration",
  [ROUTES.venueGateway]: "venue-gateway",
  [ROUTES.reservationDefaults]: "reservation-defaults",
  [ROUTES.onlineSettings]: "online-settings",
  [ROUTES.clubReservationSettings]: "club-reservation-settings",
  [ROUTES.createUser]: "create-user",
  [ROUTES.modifyUser]: "modify-user",
  [ROUTES.addUserToLocations]: "add-user-to-locations",
  [ROUTES.navigationManagement]: "navigation-management",
  [ROUTES.navigationDropDowns]: "navigation-drop-downs",
  [ROUTES.navigationRoles]: "navigation-roles",
  [ROUTES.navigationLocation]: "navigation-location",
  [ROUTES.news]: "news",
  [ROUTES.roles]: "roles",
  [ROUTES.comicManager]: "comic-manager",
  [ROUTES.logInManagement]: "log-in-management",
  [ROUTES.transactionLogViewer]: "transaction-log-viewer",
  [ROUTES.featuresAndTips]: "features-and-tips",
  [ROUTES.sumContactLeads]: "sum-contact-leads",
  [ROUTES.events]: "events",
}

export function reportViewerUrl(reportType?: string) {
  if (!reportType) return ROUTES.reports
  return `${ROUTES.reports}?report=${encodeURIComponent(reportType)}`
}

/** Human-readable labels used in breadcrumbs and page titles. */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.calendar]: "Calendar",
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
  [ROUTES.webServers]: "Web Servers",
  [ROUTES.domains]: "Domains",
  [ROUTES.locations]: "Locations",
  [ROUTES.domainConfiguration]: "Domain Configuration",
  [ROUTES.venueGateway]: "Venue Gateway",
  [ROUTES.reservationDefaults]: "Reservation Defaults",
  [ROUTES.onlineSettings]: "Online Settings",
  [ROUTES.clubReservationSettings]: "Club Reservation Settings",
  [ROUTES.createUser]: "Create User",
  [ROUTES.modifyUser]: "Modify User",
  [ROUTES.addUserToLocations]: "Add User To Location(s)",
  [ROUTES.navigationManagement]: "Navigation Management",
  [ROUTES.navigationDropDowns]: "Navigation Drop Downs",
  [ROUTES.navigationRoles]: "Navigation Roles",
  [ROUTES.navigationLocation]: "Navigation Location",
  [ROUTES.news]: "News",
  [ROUTES.roles]: "Roles",
  [ROUTES.comicManager]: "Comic Manager",
  [ROUTES.logInManagement]: "Log In Management",
  [ROUTES.transactionLogViewer]: "Transaction Log Viewer",
  [ROUTES.featuresAndTips]: "Features And Tips",
  [ROUTES.sumContactLeads]: "SUM Contact Leads",
  [ROUTES.events]: "Events",
  [ROUTES.venueInfo]: "Venue Info",
  [ROUTES.venueShowTimes]: "Venue Show Times",
  [ROUTES.foodMenu]: "Food Menu",
  [ROUTES.venueAds]: "Venue Ads",
  [ROUTES.venueRotatingAds]: "Rotating Ads",
  [ROUTES.giftOfLaughter]: "Gift of Laughter",
  [ROUTES.venueSocials]: "Social",
  [ROUTES.venueSectionDescriptions]: "Section Description",
  [ROUTES.formEmails]: "Form Emails",
  [ROUTES.employmentOpenings]: "Employment Openings",
  [ROUTES.employmentQuestions]: "Employment Questions",
  [ROUTES.employmentApplicants]: "Employment Applicants",
  [ROUTES.webpagesText]: "Webpages Text",
  [ROUTES.freeForms]: "Free Form",
  [ROUTES.businessContacts]: "Business Contacts",
  [ROUTES.commentCards]: "Comment Cards",
  [ROUTES.giftCards]: "Gift Cards",
  [ROUTES.giftCertificate]: "Gift Certificate",
  [ROUTES.reports]: "Reports",
  [ROUTES.transactions]: "Transactions",
  [ROUTES.ticketDefault]: "Ticket Default",
  [ROUTES.changePassword]: "Change Password",
  [ROUTES.login]: "Login",
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
  if (
    pathname === ROUTES.venueInfo ||
    pathname === ROUTES.venueShowTimes ||
    pathname === ROUTES.foodMenu ||
    pathname === ROUTES.venueAds ||
    pathname === ROUTES.venueRotatingAds ||
    pathname === ROUTES.giftOfLaughter ||
    pathname === ROUTES.venueSocials ||
    pathname === ROUTES.venueSectionDescriptions ||
    pathname === ROUTES.formEmails ||
    pathname === ROUTES.employmentOpenings ||
    pathname === ROUTES.employmentQuestions ||
    pathname === ROUTES.employmentApplicants ||
    pathname === ROUTES.webpagesText ||
    pathname === ROUTES.freeForms
  ) {
    return "venue-manager"
  }
  if (pathname === ROUTES.dashboard) return "dashboard"
  return "dashboard"
}
