import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { AppLayout } from "@/components/layout/app-layout"
import { userSession } from "@/data/dashboard-data"

function App() {
  return (
    <AppLayout session={userSession}>
      <DashboardPage />
    </AppLayout>
  )
}

export default App
