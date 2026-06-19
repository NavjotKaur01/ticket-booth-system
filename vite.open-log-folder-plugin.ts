import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import { spawn } from "node:child_process"
import { platform } from "node:os"

function openLogFolderHandler(_req: IncomingMessage, res: ServerResponse) {
  const appData = process.env.APPDATA

  if (platform() !== "win32" || !appData) {
    res.statusCode = 501
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ ok: false }))
    return
  }

  // `start` brings File Explorer to the foreground on Windows.
  const child = spawn("cmd", ["/c", "start", "", "explorer", appData], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  })

  child.on("error", () => {
    res.statusCode = 500
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ ok: false }))
  })

  child.on("spawn", () => {
    child.unref()
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ ok: true }))
  })
}

function attachOpenLogFolderMiddleware(server: {
  middlewares: {
    use: (
      path: string,
      handler: (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void
      ) => void
    ) => void
  }
}) {
  server.middlewares.use("/api/open-log-folder", (req, res, next) => {
    if (req.method !== "POST" && req.method !== "GET") {
      next()
      return
    }

    openLogFolderHandler(req, res)
  })
}

/** Opens the legacy log folder in File Explorer during local dev/preview on Windows. */
function openLogFolderDevPlugin(): Plugin {
  return {
    name: "open-log-folder-dev",
    configureServer(server) {
      attachOpenLogFolderMiddleware(server)
    },
    configurePreviewServer(server) {
      attachOpenLogFolderMiddleware(server)
    },
  }
}

export default openLogFolderDevPlugin
