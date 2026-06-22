import { dispatchEndpoint } from "@/lib/api/dispatch-endpoint"
import { clubmanApi } from "@/store/api/clubmanApi"
import type { AccountLoginRequest } from "@/types/api/account-login"

export async function accountLogin(request: AccountLoginRequest) {
  await dispatchEndpoint(clubmanApi.endpoints.accountLogin, request)
}
