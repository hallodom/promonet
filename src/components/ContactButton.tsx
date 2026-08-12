import type { ButtonHTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useContact } from '@/lib/contact'
import { useT } from '@/i18n/LocaleContext'

type ContactButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message?: string
  showArrow?: boolean
}

export default function ContactButton({
  message,
  showArrow = true,
  className,
  children,
  onClick,
  type = 'button',
  ...props
}: ContactButtonProps) {
  const { openContact } = useContact()
  const t = useT()

  return (
    <button
      type={type}
      className={cn(
        'group inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] transition-colors',
        className,
      )}
      onClick={(e) => {
        onClick?.(e)
        openContact(message ? { message } : undefined)
      }}
      {...props}
    >
      {children ?? t('common.contactUs')}
      {showArrow && (
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  )
}
