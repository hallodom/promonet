import type { ButtonHTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useContact } from '@/lib/contact'

type ContactButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message?: string
  showArrow?: boolean
}

export default function ContactButton({
  message,
  showArrow = true,
  className,
  children = 'Contact Us',
  onClick,
  type = 'button',
  ...props
}: ContactButtonProps) {
  const { openContact } = useContact()

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
      {children}
      {showArrow && (
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  )
}
