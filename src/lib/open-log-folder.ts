import { LOG_FOLDER_PATH } from "@/constants/app-paths"

declare global {
  interface Window {
    clubman?: {
      openLogFolder?: () => Promise<void>
    }
  }
}

async function tryOpenViaLocalServer(): Promise<boolean> {
  try {
    const response = await fetch("/api/open-log-folder", { method: "POST" })
    if (!response.ok) {
      return false
    }

    const data = (await response.json()) as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}

export async function openLogFolder(): Promise<void> {
  if (window.clubman?.openLogFolder) {
    await window.clubman.openLogFolder()
    return
  }

  const openedLocally = await tryOpenViaLocalServer()
  if (openedLocally) {
    return
  }

  console.warn(
    `Could not open log folder automatically. Paste ${LOG_FOLDER_PATH} into File Explorer.`
  )
}
