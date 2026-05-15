import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'muted'
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
