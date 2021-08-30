/** @jsxImportSource theme-ui */
import * as fcl from "@onflow/fcl"
import AuthzActions from "components/AuthzActions"
import AuthzDetails from "components/AuthzDetails"
import AuthzHeader from "components/AuthzHeader"
import Code from "components/Code"
import Dialog from "components/Dialog"
import {AuthzContextProvider} from "contexts/AuthzContext"
import useAuthzContext from "hooks/useAuthzContext"
import {useState} from "react"
import {paths} from "src/constants"
import reply from "src/reply"
import getConfig from "next/config"

function AuthzContent({
  flowAccountAddress,
  avatarUrl,
}: {
  flowAccountAddress: string
  avatarUrl: string
}) {
  const {isExpanded, codePreview} = useAuthzContext()
  const {currentUser, proposalKey, message, id} = useAuthzContext()
  const [isLoading, setIsLoading] = useState(false)

  const onApprove = () => {
    setIsLoading(true)
    fetch(paths.apiSign, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message: message}),
    })
      .then(d => d.json())
      .then(({signature}) => {
        window.parent.postMessage(
          {
            jsonrpc: "2.0",
            id,
            result: {
              f_type: "PollingResponse",
              f_vsn: "1.0.0",
              status: "APPROVED",
              reason: null,
              data: {
                f_type: "CompositeSignature",
                f_vsn: "1.0.0",
                addr: fcl.sansPrefix(currentUser.address),
                keyId: Number(proposalKey.keyId),
                signature: signature,
              },
            },
          },
          "*"
        )
        setIsLoading(false)
      })
      .catch(d => {
        // eslint-disable-next-line no-console
        console.error("FCL-DEV-WALLET FAILED TO SIGN", d)
        setIsLoading(false)
      })
  }

  const onDecline = () => reply("FCL:VIEW:CLOSE")

  return (
    <Dialog
      title="Authorize Transaction"
      header={
        !isExpanded && (
          <AuthzHeader
            flowAccountAddress={flowAccountAddress}
            avatarUrl={avatarUrl}
          />
        )
      }
      footer={
        !isExpanded && (
          <AuthzActions
            onApprove={onApprove}
            isLoading={isLoading}
            onDecline={onDecline}
          />
        )
      }
    >
      {!!codePreview ? (
        <Code title={codePreview.title} value={codePreview.value} />
      ) : (
        <AuthzDetails />
      )}
    </Dialog>
  )
}

function Authz({
  flowAccountAddress,
  avatarUrl,
}: {
  flowAccountAddress: string
  avatarUrl: string
}) {
  return (
    <AuthzContextProvider>
      <AuthzContent
        flowAccountAddress={flowAccountAddress}
        avatarUrl={avatarUrl}
      />
    </AuthzContextProvider>
  )
}

Authz.getInitialProps = async () => {
  const {publicRuntimeConfig} = getConfig()

  return {
    flowAccountAddress: publicRuntimeConfig.flowAccountAddress,
    avatarUrl: publicRuntimeConfig.avatarUrl,
  }
}

export default Authz
