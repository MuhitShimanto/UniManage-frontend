"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookOpen, CreditCard, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Enrollment, FeeInvoice, User } from "@/types/api";

export default function StudentOverviewPage() {
  const queryClient = useQueryClient();

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>("/users/me");
      return res.data.data;
    },
  });

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Enrollment[]>>("/enrollments/my");
      return res.data.data;
    },
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<FeeInvoice[]>>("/payments/invoices/my");
      return res.data.data;
    },
  });

  const dropMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      await apiClient.delete(`/enrollments/${enrollmentId}`);
    },
    onSuccess: () => {
      toast.success("Course dropped successfully");
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to drop course"));
    },
  });

  const activeEnrollments = enrollments.filter((e) => e.status === "ENROLLED");
  const activeCredits = activeEnrollments.reduce((sum, e) => sum + e.section.course.credits, 0);
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");

  const columns: ColumnDef<Enrollment>[] = [
    {
      key: "course",
      header: "Course",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {row.section.course.code} — {row.section.course.title}
          </p>
          <p className="text-xs text-slate-500">
            Section {row.section.sectionCode} • {row.section.semester.name}
          </p>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule & Room",
      render: (row) => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <p>{row.section.scheduleSlot}</p>
          <p className="text-slate-400">{row.section.room || "TBA"}</p>
        </div>
      ),
    },
    {
      key: "credits",
      header: "Credits",
      render: (row) => <span className="font-medium">{row.section.course.credits}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "enrolledAt",
      header: "Enrolled",
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.enrolledAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) =>
        row.status === "ENROLLED" ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            disabled={dropMutation.isPending}
            onClick={() => dropMutation.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
            Drop
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            {me?.studentProfile
              ? `ID: ${me.studentProfile.studentCode} • ${me.studentProfile.program?.name ?? ""}`
              : "Manage your enrolled courses, credits, and tuition."}
          </p>
        </div>
        <Link href="/dashboard/enroll">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Register Courses
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Current CGPA"
          value={me?.studentProfile?.currentCgpa?.toFixed(2) ?? "0.00"}
          subtitle="Cumulative grade point"
          icon={Award}
          isLoading={loadingMe}
        />
        <StatCard
          title="Active Credits"
          value={`${activeCredits} / 18`}
          subtitle={`${activeEnrollments.length} active section(s)`}
          icon={BookOpen}
          iconClassName="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
          isLoading={loadingEnrollments}
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          subtitle="Tuition & registration"
          icon={CreditCard}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          isLoading={loadingInvoices}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Enrollments</CardTitle>
          <CardDescription>
            Active and completed course sections across semesters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={enrollments}
            columns={columns}
            keyExtractor={(r) => r.id}
            isLoading={loadingEnrollments}
            emptyTitle="No enrollments yet"
            emptyDescription="Head to Course Registration to enroll in open sections."
          />
        </CardContent>
      </Card>
    </div>
  );
}
