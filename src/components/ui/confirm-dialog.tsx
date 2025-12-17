"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "warning";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger",
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            button: "bg-red-600 hover:bg-red-700 text-white",
        },
        warning: {
            icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
            button: "bg-amber-600 hover:bg-amber-700 text-white",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 rounded-xl dark:border-gray-700 dark:text-gray-300"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 rounded-xl ${styles.button}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
