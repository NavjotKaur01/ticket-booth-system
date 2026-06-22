import { store } from "@/store"
import { getClubmanErrorMessage } from "@/store/api/baseQuery"

// RTK endpoint initiate signatures differ between queries and mutations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DispatchableEndpoint = { initiate: (...args: any[]) => any }

export async function dispatchEndpoint<TData, TArg>(
  endpoint: DispatchableEndpoint,
  arg: TArg,
  options?: object
): Promise<TData> {
  try {
    const action = endpoint.initiate(arg, options)
    const result = store.dispatch(action) as { unwrap: () => Promise<TData> }
    return await result.unwrap()
  } catch (error) {
    throw new Error(getClubmanErrorMessage(error))
  }
}
