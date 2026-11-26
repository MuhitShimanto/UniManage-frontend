"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, GraduationCap, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage, getRoleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, AuthSession, Role } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS: Array<{
  role: Role;
  label: string;
  email: string;
  password: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}> = [
  {
    role: "ADMIN",
    label: "Admin / Registrar",
    email: "admin@university.edu",
    password: "Password@123",
    description: "Analytics, Academics, Users & Invoices",
    icon: ShieldCheck,
    accent: "text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400",
  },
  {
    role: "STUDENT",
    label: "Student",
    email: "student@university.edu",
    password: "Password@123",
    description: "Course Registration, Transcript & Fees",
    icon: GraduationCap,
    accent: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400",
  },
  {
    role: "INSTRUCTOR",
    label: "Instructor",
    email: "instructor@university.edu",
    password: "Password@123",
    description: "Sections, Bulk Attendance & Grading",
    icon: BookOpen,
    accent: "text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [demoLoadingRole, setDemoLoadingRole] = useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function performLogin(email: string, password: string) {
    const res = await apiClient.post<ApiResponse<AuthSession>>("/auth/login", {
      email,
      password,
    });
    const { user, accessToken, refreshToken } = res.data.data;
    setSession(user, accessToken, refreshToken);
    toast.success(`Welcome back, ${user.name}!`);
    router.push(getRoleDashboardPath(user.role));
    router.refresh();
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      await performLogin(values.email, values.password);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid email or password"));
    }
  }

  async function handleDemoLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setDemoLoadingRole(account.role);
    try {
      await performLogin(account.email, account.password);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Demo login failed for ${account.label}`));
    } finally {
      setDemoLoadingRole(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-12">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your UniManage account or use one-click demo access below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || demoLoadingRole !== null}>
                <Lock className="h-4 w-4" />
                {isSubmitting ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 font-semibold text-slate-500 dark:bg-slate-900">
                  Quick Demo Login
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isLoading = demoLoadingRole === acc.role;
                return (
                  <div
                    key={acc.role}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="space-y-1.5">
                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg ${acc.accent}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {acc.label}
                      </p>
                      <p className="text-[11px] leading-tight text-slate-500">
                        {acc.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full text-xs"
                      disabled={isSubmitting || demoLoadingRole !== null}
                      onClick={() => handleDemoLogin(acc)}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isLoading ? "Signing in..." : "Demo Login"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              New student?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
                Create a Student Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
