import { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const styles = {
  success: {
    wrapper: 'border-green-200 bg-green-50 text-green-900',
    icon: 'text-green-700',
    Icon: CheckCircle,
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-700',
    Icon: XCircle,
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'text-amber-700',
    Icon: AlertTriangle,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: 'text-sky-700',
    Icon: Info,
  },
};

export default function Toast({ message, show, onClose, type = 'success', duration = 3500 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  const config = styles[type] || styles.success;
  const Icon = config.Icon;

  return (
    <div
      className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur sm:right-6 sm:top-6 ${config.wrapper}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={20} aria-hidden className={`mt-0.5 flex-shrink-0 ${config.icon}`} />
      <span className="min-w-0 flex-1 leading-relaxed">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Close notification"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
