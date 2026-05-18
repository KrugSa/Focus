
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Ticket, CalendarDays, BarChart2, Brain, Zap } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const NAV = [
  { href: "/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { href: "/tickets",   label: "Tickets",          icon: Ticket },
  { href: "/planner",   label: "Planner",           icon: Brain },
  { href: "/calendar",  label: "Calendar",          icon: CalendarDays },
  { href: "/analytics", label: "Analytics",         icon: BarChart2 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-[#0D0D11]">
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="text-primary-foreground w-5 h-5 fill-current" />
          </div>
          {state === "expanded" && (
            <span className="font-headline text-lg font-bold tracking-tight">Veloce</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={label}
              >
                <Link href={href}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
