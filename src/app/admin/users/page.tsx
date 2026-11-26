"use client";

import { Suspense } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUrlParams } from "@/hooks/useUrlParams";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Department, Role, User } from "@/types/api";

const instructorSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  departmentId: z.string().min(1, "Department required"),
  designation: z.string().min(2, "Designation required"),
});

type InstructorFormValues = z.infer<typeof instructorSchema>;

function AdminUsersClient() {
  const queryClient = useQueryClient();
  const { searchParams, updateParams } = useUrlParams();

  const q = searchParams.get("q") ?? "";
  const role = searchParams.get("role") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await apiClient.get<ApiResponse<Department[]>>("/departments")).data.data,
  });

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-users", q, role, page],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User[]>>("/admin/users", {
        params: {
          page,
          limit: 10,
          ...(q ? { q } : {}),
          ...(role ? { role } : {}),
        },
      });
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: { designation: "Lecturer" },
  });

  const createInstructorMutation = useMutation({
    mutationFn: async (vals: InstructorFormValues) => {
      await apiClient.post("/admin/instructors", vals);
    },
    onSuccess: () => {
      toast.success("Instructor account created!");
      reset({ designation: "Lecturer" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create instructor")),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: Role }) => {
      await apiClient.patch(`/admin/users/${id}/role`, { role: newRole });
    },
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update role")),
  });

  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "code",
      header: "ID / Profile",
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {row.studentProfile?.studentCode || row.instructorProfile?.employeeCode || "Admin"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      key: "created",
      header: "Joined",
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "changeRole",
      header: "Change Role",
      render: (row) => (
        <select
          value={row.role}
          aria-label={`Change role for ${row.name}`}
          onChange={(e) =>
            updateRoleMutation.mutate({ id: row.id, newRole: e.target.value as Role })
          }
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="STUDENT">STUDENT</option>
          <option value="INSTRUCTOR">INSTRUCTOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Users & Faculty Management
        </h1>
        <p className="text-sm text-slate-500">
          Search users, manage roles, and onboard new faculty instructors.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Instructor</CardTitle>
            <CardDescription>Provision a faculty account with employee ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((vals) => createInstructorMutation.mutate(vals))}
              className="space-y-3"
            >
              <div>
                <Input placeholder="Full Name" {...register("name")} />
                {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
              </div>
              <div>
                <Input type="email" placeholder="faculty@university.edu" {...register("email")} />
                {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
              </div>
              <div>
                <Input type="password" placeholder="Initial Password" {...register("password")} />
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>
              <div>
                <select
                  {...register("departmentId")}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-xs text-rose-600">{errors.departmentId.message}</p>
                )}
              </div>
              <div>
                <Input placeholder="Designation (e.g. Assistant Professor)" {...register("designation")} />
                {errors.designation && (
                  <p className="text-xs text-rose-600">{errors.designation.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <UserPlus className="h-4 w-4" />
                {createInstructorMutation.isPending ? "Creating..." : "Create Instructor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              value={q}
              onChange={(val) => updateParams({ q: val, page: 1 })}
              placeholder="Search by name or email..."
              className="flex-1"
            />
            <select
              value={role}
              onChange={(e) => updateParams({ role: e.target.value, page: 1 })}
              aria-label="Filter by role"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="INSTRUCTOR">INSTRUCTOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <DataTable
            data={usersRes?.data ?? []}
            columns={columns}
            keyExtractor={(r) => r.id}
            isLoading={isLoading}
            meta={usersRes?.meta}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AdminUsersClient />
    </Suspense>
  );
}
