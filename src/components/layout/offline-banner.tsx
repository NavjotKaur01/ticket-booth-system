import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

import { clubmanApi } from "@/store/api/clubmanApi"
import { useAppDispatch } from "@/store/hooks"
import { cn } from "@/lib/utils"

/**
 * Booth offline banner (Phase 2). Shows when the browser reports offline;
 * on reconnect, invalidates ClubMan API tags so open screens refetch.
 */
export function OfflineBanner({ className }: { className?: string }) {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
      dispatch(
        clubmanApi.util.invalidateTags([
          "Reservation",
          "Calendar",
          "Customer",
          "ShowDetails",
        ])
      )
    }

    function handleOffline() {
      setOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [dispatch])

  if (online) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 border-b border-amber-600/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-950 dark:text-amber-100",
        className
      )}
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      <span>
        You appear to be offline. Check-In and reservation actions may fail until
        the connection returns.
      </span>
    </div>
  )
}
