import type { ReactNode } from 'react'
import catalog from '@/data/apps.json'
import overrides from '@/data/product-websites.json'
import { cn } from '@/lib/cn'

type CatalogApp = {
  name: string
  aliases?: string[]
  website?: string
}

const productWebsites = new Map<string, string>()

for (const app of catalog.apps as CatalogApp[]) {
  if (!app.website) continue
  productWebsites.set(app.name.toLowerCase(), app.website)
  for (const alias of app.aliases ?? []) {
    productWebsites.set(alias.toLowerCase(), app.website)
  }
}

for (const [name, website] of Object.entries(overrides)) {
  productWebsites.set(name.toLowerCase(), website)
}

export function productWebsite(name: string) {
  return productWebsites.get(name.trim().toLowerCase())
}

export default function ProductLink({
  name,
  children = name,
  className,
}: {
  name: string
  children?: ReactNode
  className?: string
}) {
  const website = productWebsite(name)

  if (!website) return <>{children}</>

  return (
    <a
      href={website}
      target="_blank"
      rel="noreferrer"
      className={cn('underline decoration-current/30 underline-offset-[0.18em] hover:text-voltage', className)}
      aria-label={`${name} website (opens in a new tab)`}
    >
      {children}
    </a>
  )
}
