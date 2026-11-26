"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_NAV: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/enroll", label: "Course Registration", icon: BookOpen },
    { href: "/dashboard/transcript", label: "Transcript & Attendance", icon: Award },
    { href: "/dashboard/payments", label: "Tuition & Payments", icon: CreditCard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  ],
  INSTRUCTOR: [
    { href: "/instructor", label: "My Sections", icon: CalendarCheck },
    { href: "/instructor/profile", label: "My Profile", icon: UserCircle },
  ],
  ADMIN: [
    { href: "/admin", label: "Analytics", icon: BarChart3 },
    { href: "/admin/academics", label: "Academics & Courses", icon: BookOpen },
    { href: "/admin/users", label: "Users & Faculty", icon: Users },
    { href: "/admin/finance", label: "Finance & Audit", icon: Wallet },
  ],
};

export function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const navItems = ROLE_NAV[role] ?? [];

  async function handleLogout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Proceed with local logout even if token expired
    } finally {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span>UniManage</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-3 px-3">
            <StatusBadge status={role} />
          </div>
          <nav className="space-y-1" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/instructor" &&
                  item.href !== "/admin" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-3 flex items-center gap-3">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name ?? "Portal User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {role === "ADMIN"
                  ? "Registrar & Admin Portal"
                  : role === "INSTRUCTOR"
                    ? "Faculty Portal"
                    : "Student Academic Portal"}
              </span>
            </div>
          </div>
          <Link href="/courses" className="text-xs font-medium text-indigo-600 hover:underline">
            Public Course Catalog →
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
