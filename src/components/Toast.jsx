import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ message, show, onClose, type = 'success' }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isError = type === 'error';
  const bgClass = isError ? 'bg-red-600' : 'bg-green-600';
  const Icon = isError ? XCircle : CheckCircle;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 ${bgClass} text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-3 text-sm font-medium min-w-[220px] max-w-[90%] justify-center`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} aria-hidden className="flex-shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}
