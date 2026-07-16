import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/routes"
import { reportErrorMessage } from "@/lib/app-toast"
import { useAuth } from "@/contexts/auth-context"

const REQUIRED_FIELD_MESSAGE = "This field is required"
const INVALID_CREDENTIALS_MESSAGE = "Invalid user name or password"

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    password?: string
  }>({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const nextFieldErrors = {
      username: username.trim() ? undefined : REQUIRED_FIELD_MESSAGE,
      password: password ? undefined : REQUIRED_FIELD_MESSAGE,
    }

    setFieldErrors(nextFieldErrors)

    if (nextFieldErrors.username || nextFieldErrors.password) {
      return
    }

    try {
      await login(username, password)
      navigate(ROUTES.dashboard, { replace: true })
    } catch {
      reportErrorMessage(setError, INVALID_CREDENTIALS_MESSAGE)
    }
  }

  function validateRequiredField(field: "username" | "password", value: string) {
    setFieldErrors((current) => ({
      ...current,
      [field]: value.trim() ? undefined : REQUIRED_FIELD_MESSAGE,
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <Card className="w-full max-w-[24rem] gap-0 rounded-xl border-border/80 bg-card py-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="px-6 pt-8 pb-8 sm:px-8">
          <h1 className="text-center text-xl font-semibold tracking-tight text-foreground">
            Sign In
          </h1>

          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            {error ? (
              <div className="flex justify-center">
                <p className="text-center text-sm text-destructive">{error}</p>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="login-username" className="text-sm font-medium">
                Username
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="login-username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setError(null)
                  setFieldErrors((current) => ({ ...current, username: undefined }))
                }}
                onBlur={(event) => validateRequiredField("username", event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={
                  fieldErrors.username ? "login-username-error" : undefined
                }
                className="h-10 bg-background"
              />
              {fieldErrors.username ? (
                <p id="login-username-error" className="text-sm text-destructive">
                  {fieldErrors.username}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Password
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError(null)
                    setFieldErrors((current) => ({ ...current, password: undefined }))
                  }}
                  onBlur={(event) => validateRequiredField("password", event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "login-password-error" : undefined
                  }
                  className="h-10 bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="login-password-error" className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
