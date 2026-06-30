import { BrowserRouter, Route, Routes } from "react-router-dom"

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
            <Route path="gift-cards" element={<GiftCards />} />
            <Route path="gift-certificate" element={<GiftCertificate />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
