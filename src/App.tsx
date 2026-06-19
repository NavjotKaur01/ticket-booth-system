import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Dashboard } from "@/components/dashboard/dashboard"
import { AppLayout } from "@/components/layout/app-layout"
import { MarketingFilter } from "@/pages/marketing-filter"
import { Performers } from "@/pages/performers"
import { PreSalePrivateShow } from "@/pages/pre-sale-private-show"
import { Promotions } from "@/pages/promotions"
import { CheckIn } from "@/pages/check-in"
import { Reservations } from "@/pages/reservations"
import { ShowTimes } from "@/pages/show-times"
import { SearchCustomer } from "@/pages/search-customer"
import { SystemDefaults } from "@/pages/system-defaults"
import { UserAccess } from "@/pages/user-access"
import { Users } from "@/pages/users"
import { BusinessContacts } from "@/pages/business-contacts"
import { CommentCards } from "@/pages/comment-cards"
import { GiftCards } from "@/pages/gift-cards"
import { userSession } from "@/data/dashboard"

/** Root router — all pages share AppLayout (sidebar + header). */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout session={userSession} />}>
          <Route index element={<Dashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="check-in" element={<CheckIn />} />

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

          <Route path="ticketbooth">
            <Route path="business-contacts" element={<BusinessContacts />} />
            <Route path="comment-cards" element={<CommentCards />} />
            <Route path="gift-cards" element={<GiftCards />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
