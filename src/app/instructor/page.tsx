"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calendar, MapPin, Users } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Section, User } from "@/types/api";

export default function InstructorDashboardPage() {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Instructor Workspace
        </h1>
        <p className="text-sm text-slate-500">
          {me?.instructorProfile
            ? `${me.instructorProfile.designation} • Employee ID: ${me.instructorProfile.employeeCode}`
            : "Manage your assigned course sections, attendance, and gradebooks."}
        </p>
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
          iconClassName="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
          isLoading={loadingMe || loadingSections}
        />
        <StatCard
          title="Average Seat Fill"
          value={totalCapacity > 0 ? `${Math.round((totalStudents / totalCapacity) * 100)}%` : "0%"}
          subtitle="Section utilization"
          icon={Calendar}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          isLoading={loadingMe || loadingSections}
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section Enrollment Overview</CardTitle>
            <CardDescription>Enrolled students vs maximum section capacity</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
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

      {loadingSections ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No sections assigned"
          description="You do not have any sections assigned for this semester yet."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.id} interactive className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                    {section.course.code} • Section {section.sectionCode}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {section.semester.name}
                  </span>
                </div>
                <CardTitle className="mt-2">{section.course.title}</CardTitle>
                <CardDescription>
                  {section.enrolledCount} / {section.maxCapacity} Students Enrolled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {section.scheduleSlot}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Room: {section.room || "TBA"}
                  </p>
                </div>
                <Link href={`/instructor/sections/${section.id}`}>
                  <Button className="w-full">
                    Open Attendance & Gradebook
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
