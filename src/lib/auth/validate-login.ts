import { authConfig } from "@/config/auth-config"

export function isValidLoginCredential(userName: string, userPwd: string) {
  const normalizedUser = userName.trim().toLowerCase()
  const expectedUser = authConfig.validLogin.userName.toLowerCase()

  return normalizedUser === expectedUser && userPwd === authConfig.validLogin.userPwd
}

export function getInvalidLoginMessage() {
  return "Invalid username or password."
}
