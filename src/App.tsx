import { BrowserRouter, Route, Routes } from "react-router-dom"

import { GiftFeatureGuard } from "@/components/auth/gift-feature-guard"
import { ProtectedLayout } from "@/components/auth/protected-layout"
import { Dashboard } from "@/components/dashboard/dashboard"
import { BusinessContacts } from "@/pages/business-contacts"
import { ChangePassword } from "@/pages/change-password"
import { CheckIn } from "@/pages/check-in"
import { CommentCards } from "@/pages/comment-cards"
import { EmploymentApplicants } from "@/pages/employment-applicants"
import { EmploymentOpenings } from "@/pages/employment-openings"
import { EmploymentQuestions } from "@/pages/employment-questions"
import { FoodMenu } from "@/pages/food-menu"
import { FormEmails } from "@/pages/form-emails"
import { FreeForms } from "@/pages/free-forms"
import { GiftOfLaughter } from "@/pages/gift-of-laughter"
import { GiftCards } from "@/pages/gift-cards"
import { GiftCertificate } from "@/pages/gift-certificate"
import { Login } from "@/pages/login"
import { MarketingFilter } from "@/pages/marketing-filter"
import { Performers } from "@/pages/performers"
import { PreSalePrivateShow } from "@/pages/pre-sale-private-show"
import { Promotions } from "@/pages/promotions"
import { Reports } from "@/pages/reports"
import { Reservations } from "@/pages/reservations"
import { SearchCustomer } from "@/pages/search-customer"
import { ShowTimes } from "@/pages/show-times"
import { SystemDefaults } from "@/pages/system-defaults"
import { TicketDefault } from "@/pages/ticket-default"
import { Transactions } from "@/pages/transactions"
import { UserAccess } from "@/pages/user-access"
import { Users } from "@/pages/users"
import { ClubReservationSettings } from "@/pages/club-reservation-settings"
import { OnlineSettings } from "@/pages/online-settings"
import { ReservationDefaults } from "@/pages/reservation-defaults"
import { DomainConfigurationPage } from "@/pages/domain-configuration"
import { Locations } from "@/pages/locations"
import { Domains } from "@/pages/domains"
import { VenueGateway } from "@/pages/venue-gateway"
import { WebServers } from "@/pages/web-servers"
import { CreateUser } from "@/pages/create-user"
import { ModifyUser } from "@/pages/modify-user"
import { AddUserToLocations } from "@/pages/add-user-to-locations"
import { NavigationManagement } from "@/pages/navigation-management"
import { NavigationDropDowns } from "@/pages/navigation-drop-downs"
import { NavigationRoles } from "@/pages/navigation-roles"
import { NavigationLocation } from "@/pages/navigation-location"
import { News } from "@/pages/news"
import { RolesManagement } from "@/pages/roles-management"
import { ComicManager } from "@/pages/comic-manager"
import { LoginManagement } from "@/pages/login-management"
import { TransactionLogViewer } from "@/pages/transaction-log-viewer"
import { VenueAds } from "@/pages/venue-ads"
import { VenueRotatingAds } from "@/pages/venue-rotating-ads"
import { VenueInfo } from "@/pages/venue-info"
import { VenueSectionDescriptions } from "@/pages/venue-section-descriptions"
import { VenueShowTimes } from "@/pages/venue-show-times"
import { VenueSocials } from "@/pages/venue-socials"
import { WebpagesText } from "@/pages/webpages-text"
import EventCalendar from "./components/calendar/EventCalendar"

/** Root router - login is public; app routes require auth. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="check-in" element={<CheckIn />} />
          <Route path="reports" element={<Reports />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="calendar" element={<EventCalendar />} />

          <Route path="my-account">
            <Route path="ticket-default" element={<TicketDefault />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="administrator">
            <Route path="customers" element={<SearchCustomer />} />
            <Route path="performers" element={<Performers />} />
            <Route path="marketing-filter" element={<MarketingFilter />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="show-times" element={<ShowTimes />} />
            <Route
              path="pre-sale-private-show"
              element={<PreSalePrivateShow />}
            />
            <Route path="system-defaults" element={<SystemDefaults />} />
            <Route path="user-access" element={<UserAccess />} />
            <Route path="users" element={<Users />} />
            <Route path="web-servers" element={<WebServers />} />
            <Route path="domains" element={<Domains />} />
            <Route path="locations" element={<Locations />} />
            <Route
              path="domain-configuration"
              element={<DomainConfigurationPage />}
            />
            <Route path="venue-gateway" element={<VenueGateway />} />
            <Route
              path="reservation-defaults"
              element={<ReservationDefaults />}
            />
            <Route path="online-settings" element={<OnlineSettings />} />
            <Route
              path="club-reservation-settings"
              element={<ClubReservationSettings />}
            />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="modify-user" element={<ModifyUser />} />
            <Route
              path="add-user-to-locations"
              element={<AddUserToLocations />}
            />
            <Route
              path="navigation-management"
              element={<NavigationManagement />}
            />
            <Route path="navigation-drop-downs" element={<NavigationDropDowns />} />
            <Route path="navigation-roles" element={<NavigationRoles />} />
            <Route path="navigation-location" element={<NavigationLocation />} />
            <Route path="news" element={<News />} />
            <Route path="roles" element={<RolesManagement />} />
            <Route path="comic-manager" element={<ComicManager />} />
            <Route path="log-in-management" element={<LoginManagement />} />
            <Route path="transaction-log-viewer" element={<TransactionLogViewer />} />
          </Route>

          <Route path="venue">
            <Route path="venue-info" element={<VenueInfo />} />
            <Route path="venue-show-times" element={<VenueShowTimes />} />
            <Route path="food-menu" element={<FoodMenu />} />
            <Route path="venue-ads" element={<VenueAds />} />
            <Route path="venue-rotating-ads" element={<VenueRotatingAds />} />
            <Route path="gift-of-laughter" element={<GiftOfLaughter />} />
            <Route path="venue-socials" element={<VenueSocials />} />
            <Route
              path="venue-section-descriptions"
              element={<VenueSectionDescriptions />}
            />
            <Route path="form-emails" element={<FormEmails />} />
            <Route path="employment/openings" element={<EmploymentOpenings />} />
            <Route path="employment/questions" element={<EmploymentQuestions />} />
            <Route path="employment/applicants" element={<EmploymentApplicants />} />
            <Route path="webpages-text" element={<WebpagesText />} />
            <Route path="free-forms" element={<FreeForms />} />
          </Route>

          <Route path="ticketbooth">
            <Route path="business-contacts" element={<BusinessContacts />} />
            <Route path="comment-cards" element={<CommentCards />} />
            <Route
              path="gift-cards"
              element={
                <GiftFeatureGuard feature="gift-cards">
                  <GiftCards />
                </GiftFeatureGuard>
              }
            />
            <Route
              path="gift-certificate"
              element={
                <GiftFeatureGuard feature="gift-certificate">
                  <GiftCertificate />
                </GiftFeatureGuard>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
