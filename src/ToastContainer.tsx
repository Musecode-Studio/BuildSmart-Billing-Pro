import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: number;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-green-500/10 to-green-600/10 border-green-500/30';
      case 'error':
        return 'from-red-500/10 to-red-600/10 border-red-500/30';
      case 'warning':
        return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30';
      default:
        return 'from-green-500/10 to-green-600/10 border-green-500/30';
    }
  };

  return (
    <div className="toast-wrap">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`success-notification card-glass rounded-2xl p-6 shadow-2xl max-w-sm bg-gradient-to-r ${getColorClasses(toast.type)} border`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-new-black/40">
                {getIcon(toast.type)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-lightest-blue">{toast.title}</h3>
                <button className="text-slate-400 hover:text-lightest-blue transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {toast.message && (
                <p className="text-sm text-slate-300 mt-1">{toast.message}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}