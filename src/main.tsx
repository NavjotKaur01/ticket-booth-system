import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import { AuthProvider } from "@/contexts/auth-context"
import { initTheme, ThemeProvider } from "@/components/theme-provider"
import { AppToaster } from "@/components/ui/app-toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { store } from "@/store"
import App from "./App.tsx"
import "./index.css"

initTheme()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <App />
            <AppToaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
