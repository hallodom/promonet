import { useEffect, useState } from 'react'

const USER = 'eddy'
const DOMAIN = 'promonetconsulting.com'

type Props = {
  className?: string
}

/** Assembles the address client-side so crawlers don't see a raw mailto in HTML. */
export default function SpamProtectedEmail({ className }: Props) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setEmail(`${USER}@${DOMAIN}`)
  }, [])

  const openMail = () => {
    window.location.href = `mailto:${USER}@${DOMAIN}`
  }

  if (!email) {
    return (
      <button
        type="button"
        onClick={openMail}
        className={`bg-transparent border-0 p-0 font-inherit cursor-pointer ${className ?? ''}`}
        aria-label="Email Eddy at Promonet Consulting"
      >
        {USER}
        <span aria-hidden="true"> [at] </span>
        <span className="sr-only">@</span>
        {DOMAIN}
      </button>
    )
  }

  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  )
}
