import { render, screen } from '@testing-library/react';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { describe, it, expect, vi } from 'vitest';

// Mock navigation/router
vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
    useRouter: () => ({ push: vi.fn() }),
}));

describe('AppSidebar', () => {
    it('renders application title or logo', () => {
        render(
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
        );
        expect(screen.getByText(/Architecture Planning/i)).toBeDefined();
    });

    it('renders all links for ADMIN', () => {
        // We force cast role to skip strict type checking in test file if needed, or match the type exact
        const adminUser = { name: 'Admin', email: 'admin@test.com', avatar: '', role: 'ADMIN' as "ADMIN" };
        render(
            <SidebarProvider>
                <AppSidebar user={adminUser} />
            </SidebarProvider>
        );
        expect(screen.getByText(/Dashboard/i)).toBeDefined();
        expect(screen.getByText(/Projects/i)).toBeDefined();
        expect(screen.getByText(/Reviews/i)).toBeDefined();
        expect(screen.getByText(/Schedule/i)).toBeDefined();
        expect(screen.getByText(/Settings/i)).toBeDefined();
    });

    it('hides restricted links for standard USER', () => {
        const standardUser = { name: 'User', email: 'user@test.com', avatar: '', role: 'USER' as "USER" };
        render(
            <SidebarProvider>
                <AppSidebar user={standardUser} />
            </SidebarProvider>
        );
        expect(screen.getByText(/Dashboard/i)).toBeDefined();
        expect(screen.queryByText(/Projects/i)).toBeNull();
        expect(screen.queryByText(/Reviews/i)).toBeNull();
        expect(screen.queryByText(/Schedule/i)).toBeNull();
        expect(screen.queryByText(/Settings/i)).toBeNull();
    });
});
