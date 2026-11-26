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

const ROLE_CARD_STYLES: Record<Role, string> = {
  ADMIN: "border-purple-200/70 bg-purple-50/65",
  INSTRUCTOR: "border-sky-200/70 bg-sky-50/65",
  STUDENT: "border-indigo-200/70 bg-indigo-50/65",
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
    <div className="min-h-screen bg-slate-50/70">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-5">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
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

        <div className="flex-1 overflow-y-auto px-3 py-5">
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
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50/90 text-indigo-700 shadow-xs ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 space-y-3 border-t border-slate-200/80 p-4">
          {/* Flat Role-Tinted Glass User + Role Card */}
          <div
            className={cn(
              "rounded-xl border p-3 backdrop-blur-md ring-1 ring-white/80 ring-inset shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)]",
              ROLE_CARD_STYLES[role]
            )}
          >
            <div className="flex items-center gap-2.5">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white ring-2 ring-white shadow-xs">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {user?.name ?? "Portal User"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            <div className="relative mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Role
              </span>
              <StatusBadge status={role} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-white/65 px-3.5 py-2.5 text-xs font-semibold text-slate-600 backdrop-blur-md ring-1 ring-white/80 ring-inset shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] transition-all duration-150 active:scale-[0.98] hover:border-rose-200/80 hover:bg-rose-50/70 hover:text-rose-600"
          >
            <span>Sign Out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content shifted right on lg screens */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-slate-800">
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
