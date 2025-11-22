import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    requireTyping?: string; // If provided, user must type this string to confirm
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    requireTyping,
}) => {
    const [typedValue, setTypedValue] = useState('');
    const isConfirmDisabled = requireTyping ? typedValue !== requireTyping : false;

    const handleConfirm = () => {
        if (!isConfirmDisabled) {
            onConfirm();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">{message}</p>
                    </div>
                </div>

                {requireTyping && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type <strong>{requireTyping}</strong> to confirm
                        </label>
                        <input
                            type="text"
                            value={typedValue}
                            onChange={(e) => setTypedValue(e.target.value)}
                            className="input-field"
                            placeholder={requireTyping}
                        />
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-primary hover:bg-primary-700 focus:ring-primary'
                            } ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
