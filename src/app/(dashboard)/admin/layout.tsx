
import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-muted/40 px-6 py-4">
                <div className="flex items-center gap-6">
                    <h2 className="text-lg font-semibold">Admin Console</h2>
                    <nav className="flex gap-4 text-sm font-medium">
                        <Link
                            href="/admin/checklists"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Checklists
                        </Link>
                        {/* Future admin links can go here */}
                    </nav>
                </div>
            </header>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}
