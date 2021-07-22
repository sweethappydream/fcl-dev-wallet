/** @jsxImportSource theme-ui */
import AccountListItemScopes from "components/AccountListItemScopes"
import Button from "components/Button"
import ConnectedAppHeader from "components/ConnectedAppHeader"
import FormErrors from "components/FormErrors"
import {Field, Form, Formik} from "formik"
import {Account, NewAccount} from "pages/api/accounts"
import {useState} from "react"
import {paths} from "src/constants"
import {updateAccountSchemaClient} from "src/validate"
import {mutate} from "swr"
import {Box, Link, Themed} from "theme-ui"
import {CustomInputComponent} from "./Inputs"

const styles = {
  footer: {
    lineHeight: 1.7,
    color: "gray.400",
    fontSize: 0,
  },
}

export default function AccountForm({
  account,
  onSubmitComplete,
}: {
  account: Account | NewAccount
  onSubmitComplete: (createdAccountAddress?: string) => void
}) {
  const [errors, setErrors] = useState<string[]>([])

  return (
    <div>
      <Formik
        initialValues={{
          label: account.label,
          scopes: new Set(account.scopes),
        }}
        validationSchema={updateAccountSchemaClient}
        onSubmit={({label, scopes}, {setSubmitting}) => {
          setErrors([])
          const url = account.address
            ? paths.apiAccountUpdate(account.address)
            : paths.apiAccountsNew
          const data = {
            address: account.address,
            label,
            scopes: Array.from(scopes),
          }
          fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
          })
            .then(d => d.json())
            .then(resp => {
              if (resp.errors) throw Error(resp.errors)
              const isNew = !account.address
              mutate(paths.apiAccounts).then(() => {
                setSubmitting(false)
                onSubmitComplete(isNew ? resp.address : undefined)
              })
            })
            .catch(e => {
              setErrors(e.message)
              setSubmitting(false)
            })
        }}
      >
        {({values, setFieldValue, isSubmitting, isValid}) => (
          <Form data-test="fund-account-form">
            <Box mb={4}>
              <ConnectedAppHeader
                info={false}
                account={account}
                title={
                  account.address ? "Manage Account" : "Create New Account"
                }
                description={account.address}
              />
            </Box>

            <Box mb={3}>
              <Field
                component={CustomInputComponent}
                inputLabel="Label"
                name="label"
                placeholder="Account label"
                required
              />
            </Box>

            <Box mb={3}>
              <AccountListItemScopes
                scopes={values.scopes}
                setScopes={newScopes => setFieldValue("scopes", newScopes)}
                onEditAccount={() => null}
                showManageAccount={false}
                compact={true}
              />
              <Themed.hr sx={{mt: 0, mb: 1}} />
            </Box>

            <Box mb={3}>
              <Button
                type="submit"
                block
                size="lg"
                disabled={isSubmitting || !isValid}
              >
                {account.address ? "Save" : "Create Account"}
              </Button>
            </Box>

            {errors.length > 0 && <FormErrors errors={errors} />}

            <Box mb={4}>
              <div sx={styles.footer}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Curabitur quis gravida nunc, luctus sodales erat. Ut sit amet
                lectus tempor dipiscing. Curabitur quis gravida nunc, lelit
                scelerisque ornare ut non lectus.
                <br />
                <Link variant="secondary">privacy policy</Link> and{" "}
                <Link variant="secondary">terms of service</Link>.
              </div>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  )
}
