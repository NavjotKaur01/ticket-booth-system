import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { executeAccountLogin } from "@/lib/api/account-login"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { AccountLoginRequest } from "@/types/api/account-login"

export async function accountLogin(request: AccountLoginRequest) {
  await dispatchEndpoint(clubmanApi.endpoints.accountLogin, request)
}

export { executeAccountLogin }
