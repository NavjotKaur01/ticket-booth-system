import { ToastContainer } from "react-toastify"

import { useTheme } from "@/components/theme-provider"

import "react-toastify/dist/ReactToastify.css"

/**
 * Themed react-toastify host. Mount once near the app root.
 * Uses CSS variables so light/dark match the booth theme.
 */
export function AppToaster() {
  const { theme } = useTheme()

  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
      toastClassName="app-toast"
      className="app-toast-container"
      limit={4}
    />
  )
}
