import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Dashboard } from "@/components/dashboard/dashboard"
import { AppLayout } from "@/components/layout/app-layout"
import { MarketingFilter } from "@/pages/marketing-filter"
import { Performers } from "@/pages/performers"
import { CheckIn } from "@/pages/check-in"
import { Reservations } from "@/pages/reservations"
import { SearchCustomer } from "@/pages/search-customer"
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
          <Route path="customers" element={<SearchCustomer />} />
          <Route path="performers" element={<Performers />} />
          <Route path="marketing-filter" element={<MarketingFilter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
