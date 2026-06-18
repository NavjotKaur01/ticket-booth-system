import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Dashboard } from "@/components/dashboard/dashboard"
import { AppLayout } from "@/components/layout/app-layout"
import { CheckIn } from "@/pages/check-in"
import { Reservations } from "@/pages/reservations"
import { userSession } from "@/data/dashboard"

/** Root router — all pages share AppLayout (sidebar + header). */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout session={userSession} />}>
          <Route index element={<Dashboard />} />
          <Route path="reservation" element={<Reservations />} />
          <Route path="check-in" element={<CheckIn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
