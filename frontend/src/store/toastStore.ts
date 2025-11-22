import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));

        if (toast.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, toast.duration || 5000);
        }
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

export const useToast = () => {
    const addToast = useToastStore((state) => state.addToast);
    return {
        toast: (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
            addToast({ message, type, title, duration });
        },
        success: (message: string, title?: string) => addToast({ message, type: 'success', title }),
        error: (message: string, title?: string) => addToast({ message, type: 'error', title }),
        warning: (message: string, title?: string) => addToast({ message, type: 'warning', title }),
        info: (message: string, title?: string) => addToast({ message, type: 'info', title }),
    };
};
