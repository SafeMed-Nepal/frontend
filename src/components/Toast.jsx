import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg z-[100] flex items-center gap-2 text-sm font-medium">
      <CheckCircle size={16} aria-hidden /> {message}
    </div>
  );
}
