import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-lightest-blue" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'from-red-500/20 to-red-600/20 border-red-500/40',
          button: 'bg-red-600/80 hover:bg-red-600 border border-red-500/60 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)]'
        };
      case 'success':
        return {
          bg: 'from-green-500/20 to-green-600/20 border-green-500/40',
          button: 'bg-green-600/80 hover:bg-green-600 border border-green-500/60 hover:shadow-[0_0_10px_rgba(34,197,94,0.6)]'
        };
      case 'info':
        return {
          bg: 'from-blue-500/20 to-blue-900/20 border-blue-500/40',
          button: 'bg-blue-900/80 hover:bg-blue-900 border border-blue-500/60 hover:shadow-[0_0_10px_rgba(59,130,246,0.6)]'
        };
      default:
        return {
          bg: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40',
          button: 'bg-yellow-600/80 hover:bg-yellow-600 border border-yellow-500/60 hover:shadow-[0_0_10px_rgba(234,179,8,0.6)]'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60]">
      <div className={`card-glass rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in hover-lift bg-gradient-to-r ${colors.bg} border`}>
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-new-black/40">
              {getIcon()}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-lightest-blue mb-2">{title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={onCancel}
            className="flex-1 text-lightest-blue py-3 px-6 rounded-xl font-medium hover-lift transition-all duration-200 bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800/80"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 text-lightest-blue py-3 px-6 rounded-xl font-medium hover-lift transition-all duration-200 ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}