import {sign} from "./crypto"
import * as fcl from "@onflow/fcl"

export async function authz(account) {
  return {
    ...account,
    tempId: "SERVICE_ACCOUNT",
    addr: fcl.sansPrefix(process.env.FLOW_ACCOUNT_ADDRESS),
    keyId: Number(process.env.FLOW_ACCOUNT_KEY_ID),
    signingFunction: data => ({
      addr: fcl.withPrefix(process.env.FLOW_ACCOUNT_ADDRESS),
      keyId: Number(process.env.FLOW_ACCOUNT_KEY_ID),
      signature: sign(process.env.FLOW_ACCOUNT_PRIVATE_KEY, data.message),
    }),
  }
}
