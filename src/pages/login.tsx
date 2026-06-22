import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/routes"
import { useAuth } from "@/contexts/auth-context"

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await login(username, password)
      navigate(ROUTES.dashboard, { replace: true })
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed"
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <Card className="w-full max-w-[24rem] gap-0 rounded-xl border-border/80 bg-card py-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="px-6 pt-8 pb-8 sm:px-8">
          <h1 className="text-center text-xl font-semibold tracking-tight text-foreground">
            Sign In
          </h1>

          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="login-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="login-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username *"
                autoComplete="username"
                disabled={isLoading}
                className="h-10 bg-background"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password *"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="h-10 bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

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
