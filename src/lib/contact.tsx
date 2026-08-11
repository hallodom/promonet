import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export const CONTACT_EMAIL = 'eddy@promonetconsulting.com'

type ContactContextValue = {
  open: boolean
  defaultMessage: string
  openContact: (opts?: { message?: string }) => void
  closeContact: () => void
}

const ContactContext = createContext<ContactContextValue | null>(null)

export function ContactProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [defaultMessage, setDefaultMessage] = useState('')

  const openContact = useCallback((opts?: { message?: string }) => {
    setDefaultMessage(opts?.message ?? '')
    setOpen(true)
  }, [])

  const closeContact = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({ open, defaultMessage, openContact, closeContact }),
    [open, defaultMessage, openContact, closeContact],
  )

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}

export function useContact() {
  const ctx = useContext(ContactContext)
  if (!ctx) throw new Error('useContact must be used within ContactProvider')
  return ctx
}

