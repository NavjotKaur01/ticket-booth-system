import { toast, type ToastOptions } from "react-toastify"

const defaultOptions: ToastOptions = {
  position: "top-center",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

/** Normalize API / thrown errors into a user-facing message. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (typeof error === "string" && error.trim()) {
    return error.trim()
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }
  return fallback
}

export function toastSuccess(message: string, options?: ToastOptions) {
  const text = message.trim()
  if (!text) {
    return
  }
  toast.success(text, { ...defaultOptions, ...options })
}

export function toastError(message: string, options?: ToastOptions) {
  const text = message.trim()
  if (!text) {
    return
  }
  toast.error(text, { ...defaultOptions, autoClose: 5000, ...options })
}

export function toastWarning(message: string, options?: ToastOptions) {
  const text = message.trim()
  if (!text) {
    return
  }
  toast.warning(text, { ...defaultOptions, ...options })
}

export function toastInfo(message: string, options?: ToastOptions) {
  const text = message.trim()
  if (!text) {
    return
  }
  toast.info(text, { ...defaultOptions, ...options })
}

/**
 * Keep existing setter behavior (dialogs / banners) and also show a toast.
 * Does not change control flow — only notification.
 */
export function reportError(
  setError: (value: string | null) => void,
  error: unknown,
  fallback: string
) {
  const message = getErrorMessage(error, fallback)
  setError(message)
  toastError(message)
}

export function reportErrorMessage(
  setError: (value: string | null) => void,
  message: string
) {
  const text = message.trim()
  setError(text)
  toastError(text)
}
