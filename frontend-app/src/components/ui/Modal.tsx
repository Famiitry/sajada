import type { ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = {
  title: string
  children: ReactNode
  open: boolean
  confirmLabel?: string
  danger?: boolean
  onClose: () => void
  onConfirm?: () => void
}

export function Modal({
  title,
  children,
  open,
  confirmLabel = 'Confirmar',
  danger = false,
  onClose,
  onConfirm
}: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onClose}>
            x
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {onConfirm && (
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
