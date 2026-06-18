import { BrowserRouter, Route, Routes } from "react-router-dom"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AppLayout } from "@/components/layout/app-layout"
import { ReservationsPage } from "@/pages/reservations-page"
import { userSession } from "@/data/dashboard-data"

/** Root router — all pages share AppLayout (sidebar + header). */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout session={userSession} />}>
          <Route index element={<DashboardPage />} />
          <Route path="reservation" element={<ReservationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
