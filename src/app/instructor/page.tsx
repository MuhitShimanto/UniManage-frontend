"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calendar, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Section, User } from "@/types/api";

export default function InstructorOverviewPage() {
  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>("/users/me");
      return res.data.data;
    },
  });

  const instructorId = me?.instructorProfile?.id;

  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["instructor-sections", instructorId],
    enabled: Boolean(instructorId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Section[]>>("/sections", {
        params: { instructorId },
      });
      return res.data.data;
    },
  });

  const totalStudents = sections.reduce((sum, s) => sum + s.enrolledCount, 0);
  const totalCapacity = sections.reduce((sum, s) => sum + s.maxCapacity, 0);

  const chartData = sections.map((s) => ({
    name: `${s.course.code}-${s.sectionCode}`,
    Enrolled: s.enrolledCount,
    Capacity: s.maxCapacity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Instructor Overview
          </h1>
          <p className="text-sm text-slate-500">
            {me?.instructorProfile
              ? `${me.instructorProfile.designation} • Employee ID: ${me.instructorProfile.employeeCode}`
              : "Summary of your teaching load and section enrollment."}
          </p>
        </div>
        <Link href="/instructor/sections">
          <Button>
            View My Sections
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Assigned Sections"
          value={sections.length}
          subtitle="Active teaching load"
          icon={BookOpen}
          isLoading={loadingMe || loadingSections}
        />
        <StatCard
          title="Total Enrolled Students"
          value={totalStudents}
          subtitle={`Across ${totalCapacity} total seats`}
          icon={Users}
          iconClassName="bg-sky-50 text-sky-600"
          isLoading={loadingMe || loadingSections}
        />
        <StatCard
          title="Average Seat Fill"
          value={totalCapacity > 0 ? `${Math.round((totalStudents / totalCapacity) * 100)}%` : "0%"}
          subtitle="Section utilization"
          icon={Calendar}
          iconClassName="bg-emerald-50 text-emerald-600"
          isLoading={loadingMe || loadingSections}
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section Enrollment Overview</CardTitle>
            <CardDescription>Enrolled students vs maximum section capacity</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="Enrolled" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
