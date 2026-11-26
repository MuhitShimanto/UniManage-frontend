"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CreditCard, GraduationCap, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminDashboardStats, ApiResponse, AuditLog } from "@/types/api";

const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#10b981"];

export default function AdminOverviewPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard-stats");
      return res.data.data;
    },
  });

  const { data: logsRes } = useQuery({
    queryKey: ["admin-audit-recent"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AuditLog[]>>("/admin/audit-logs", {
        params: { page: 1, limit: 5 },
      });
      return res.data.data;
    },
  });

  const barData = stats
    ? [
        { name: "Students", count: stats.totalStudents },
        { name: "Instructors", count: stats.totalInstructors },
        { name: "Courses", count: stats.totalCourses },
        { name: "Enrollments", count: stats.totalEnrollments },
      ]
    : [];

  const pieData = stats
    ? [
        { name: "Students", value: stats.totalStudents || 1 },
        { name: "Instructors", value: stats.totalInstructors || 1 },
        { name: "Paid Txns", value: stats.totalPaidTransactions || 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Registrar & Admin Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Real-time overview of campus enrollments, faculty, courses, and tuition revenue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={GraduationCap}
          isLoading={loadingStats}
        />
        <StatCard
          title="Total Instructors"
          value={stats?.totalInstructors ?? 0}
          icon={Users}
          iconClassName="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
          isLoading={loadingStats}
        />
        <StatCard
          title="Active Courses"
          value={stats?.totalCourses ?? 0}
          subtitle={`${stats?.totalEnrollments ?? 0} enrollments`}
          icon={BookOpen}
          iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
          isLoading={loadingStats}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenueBdt ?? 0, "BDT")}
          subtitle={`${stats?.totalPaidTransactions ?? 0} paid transactions`}
          icon={CreditCard}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          isLoading={loadingStats}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campus Metrics</CardTitle>
            <CardDescription>Users, curriculum, and active enrollments</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community & Transaction Mix</CardTitle>
            <CardDescription>Distribution across students, faculty, and settlements</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Audit Activity</CardTitle>
          <CardDescription>Latest recorded administrative and academic actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(logsRes ?? []).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="font-mono text-xs font-semibold text-indigo-600">
                    {log.action}
                  </span>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">
                    ({log.entityType}) {log.actor ? `by ${log.actor.email}` : ""}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
