// Minimal implementation of use-toast for immediate usage
import { useState, useEffect } from 'react';

export type ToastProps = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

const listeners: Array<(state: any) => void> = [];
let memoryState: any = { toasts: [] };

function dispatch(action: any) {
    memoryState = { ...memoryState, toasts: [action.toast, ...memoryState.toasts] };
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}

function toast({ ...props }: ToastProps) {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss(id);
            },
        },
    });
    return {
        id,
        dismiss: () => dismiss(id),
        update: (props: ToastProps) => update(id, props),
    };
}

function dismiss(toastId?: string) {
    // Simplified dismiss
}

function update(toastId: string, props: ToastProps) {
    // Simplified update
}

function useToast() {
    const [state, setState] = useState(memoryState);

    useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dismiss(toastId),
    };
}

export { useToast, toast };
