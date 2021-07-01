import css from "styles/base.module.css"

export type StackError = {
  stack: string
}

export function Err({error}: {error: StackError}) {
  if (error == null) return null
  return (
    <div className={css.bad}>
      <pre>{error.stack}</pre>
    </div>
  )
}
