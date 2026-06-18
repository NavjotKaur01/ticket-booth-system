import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { initTheme, ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App.tsx"
import "./index.css"

initTheme()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
