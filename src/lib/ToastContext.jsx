import React, { createContext, useContext, useCallback, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', duration: 3500 })

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ show: true, message, type, duration })
  }, [])

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, show: false }))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        duration={toast.duration}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastContext
