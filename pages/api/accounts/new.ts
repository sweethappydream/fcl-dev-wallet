import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import newAccountTransaction from "cadence/transactions/newAccount.cdc"
import {NextApiRequest, NextApiResponse} from "next"
import {authz} from "src/authz"
import {FLOW_EVENT_TYPES} from "src/constants"
import "src/fclConfig"

type CreatedAccountResponse = {
  events: CreatedAccountEvent[]
}

type CreatedAccountEvent = {
  type: string
  data: {
    address: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // eslint-disable-next-line no-console
    console.log("Creating Account")
    const {label, scopes} = req.body
    const txId = await fcl
      .send([
        fcl.transaction(newAccountTransaction),
        fcl.args([
          fcl.arg(label, t.String),
          fcl.arg(scopes, t.Array(t.String)),
        ]),
        fcl.proposer(authz),
        fcl.payer(authz),
        fcl.limit(100),
      ])
      .then(fcl.decode)

    const txStatus: CreatedAccountResponse = await fcl.tx(txId).onceSealed()
    // eslint-disable-next-line no-console
    console.log("TX:SEALED", txStatus)

    const createdAccountEvent = txStatus.events.find(
      (e: CreatedAccountEvent) => e.type === FLOW_EVENT_TYPES.accountCreated
    )
    if (!createdAccountEvent?.data?.address) throw "Account address not created"

    res.status(200).json({address: createdAccountEvent.data.address})
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("ISSUE CREATING ACCOUNT", error)
    res.status(500).json({errors: ["Account creation failed."]})
  }
}
