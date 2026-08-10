import type { ReactNode } from 'react'
import { LINKEDIN_URL } from '@/lib/seo'
import { cn } from '@/lib/cn'
import LinkedInIcon from '@/components/LinkedInIcon'

type Props = {
  className?: string
  children?: ReactNode
}

export default function LinkedInButton({
  className,
  children = 'Contact us on LinkedIn',
}: Props) {
  return (
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] transition-colors',
        className,
      )}
    >
      <LinkedInIcon size={16} />
      {children}
    </a>
  )
}
