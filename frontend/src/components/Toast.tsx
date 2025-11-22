import React from 'react';
import { useToastStore } from '../store/toastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => {
                const Icon = icons[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={cn(
                            'pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border animate-slide-up transition-all duration-300',
                            styles[toast.type]
                        )}
                        role="alert"
                    >
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="ml-3 flex-1">
                            {toast.title && <h3 className="text-sm font-medium">{toast.title}</h3>}
                            <p className="text-sm opacity-90">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
