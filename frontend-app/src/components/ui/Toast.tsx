type ToastProps = {
  message: string
  tone?: 'success' | 'danger' | 'info'
}

export function Toast({ message, tone = 'info' }: ToastProps) {
  if (!message) return null

  return (
    <div className={`toast toast-${tone}`} role="status">
      {message}
    </div>
  )
}
