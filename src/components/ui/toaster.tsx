'use client';

import { useToast } from '@/hooks/use-toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(function ({ id, title, description, variant, ...props }: any) {
                return (
                    <div
                        key={id}
                        className={`p-4 rounded shadow-lg border ${variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                        {title && <div className="font-semibold">{title}</div>}
                        {description && <div className="text-sm text-gray-500">{description}</div>}
                    </div>
                );
            })}
        </div>
    );
}
