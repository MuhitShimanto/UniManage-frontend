"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicNavbar } from "@/components/shared/PublicNavbar";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, AuthSession, Program } from "@/types/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  phone: z.string().min(6, "Phone must be at least 6 digits").max(20).optional().or(z.literal("")),
  programId: z.string().min(1, "Please select an academic program"),
  admissionYear: z.coerce.number().int().min(2000).max(2100),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Program[]>>("/programs");
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      admissionYear: new Date().getFullYear(),
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const payload = {
        ...values,
        phone: values.phone || undefined,
      };
      const res = await apiClient.post<ApiResponse<AuthSession>>("/auth/register", payload);
      const { user, accessToken, refreshToken } = res.data.data;
      setSession(user, accessToken, refreshToken);
      toast.success("Student account created! Welcome to UniManage.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed"));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicNavbar />
      <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-12">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Registration</CardTitle>
            <CardDescription>
              Enroll in an accredited degree program and receive your student ID automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input placeholder="Grace Hopper" {...register("name")} />
                {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="grace@university.edu" {...register("email")} />
                {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Min 8 characters" {...register("password")} />
                  {errors.password && (
                    <p className="text-xs text-rose-600">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone (Optional)</label>
                  <Input placeholder="+8801700000000" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-rose-600">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Degree Program</label>
                  <select
                    {...register("programId")}
                    disabled={loadingPrograms}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Select Program...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.programId && (
                    <p className="text-xs text-rose-600">{errors.programId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Admission Year</label>
                  <Input type="number" {...register("admissionYear")} />
                  {errors.admissionYear && (
                    <p className="text-xs text-rose-600">{errors.admissionYear.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Creating Account..." : "Register as Student"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
