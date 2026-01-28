"use client"

import * as React from "react"
import {
    Calendar,
    LayoutDashboard,
    Settings,
    Users,
    FileCheck,
    FolderOpen
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data. Real data should come from props or store.
const data = {
    user: {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
            roles: ["*"], // All Roles
        },
        {
            title: "Projects",
            url: "/dashboard/projects",
            icon: FolderOpen,
            roles: ["LEADER", "ADMIN"],
        },
        {
            title: "Reviews",
            url: "/dashboard/reviews",
            icon: FileCheck,
            roles: ["REVIEWER", "ADMIN"],
        },
        {
            title: "Schedule",
            url: "/dashboard/schedule",
            icon: Calendar,
            roles: ["ORGANIZER", "ADMIN"],
        },
        {
            title: "Settings",
            url: "/dashboard/admin", // Assuming admin route
            icon: Settings,
            roles: ["ADMIN"],
        },
    ],
}

type UserRole = "LEADER" | "REVIEWER" | "ORGANIZER" | "ADMIN" | "USER"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user?: {
        name: string
        email: string
        avatar: string
        role?: UserRole
    }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    const pathname = usePathname()
    // Default to USER if no role provided (or handle as needed)
    const currentRole = user?.role || "USER"
    const currentUser = user || data.user

    const filteredNav = data.navMain.filter((item) => {
        if (item.roles.includes("*")) return true
        if (currentRole === "ADMIN") return true
        return item.roles.includes(currentRole as string)
    }).map(item => ({
        ...item,
        isActive: pathname === item.url || pathname?.startsWith(item.url + '/')
    }))

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <span className="font-bold">Architecture Planning</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredNav} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={currentUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
