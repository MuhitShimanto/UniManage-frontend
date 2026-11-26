"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, Enrollment, StudentSectionAttendance } from "@/types/api";

export default function StudentAttendancePage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Enrollment[]>>("/enrollments/my");
      return res.data.data;
    },
  });

  const activeSectionId = selectedSectionId || enrollments[0]?.sectionId || "";

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ["my-attendance", activeSectionId],
    enabled: Boolean(activeSectionId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<StudentSectionAttendance>>(
        `/attendance/student/${activeSectionId}`
      );
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">
            Track your class attendance percentage and daily logs per enrolled section.
          </p>
        </div>

        {enrollments.length > 0 && (
          <select
            value={activeSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            aria-label="Select section for attendance"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {enrollments.map((e) => (
              <option key={e.sectionId} value={e.sectionId}>
                {e.section.course.code} (Sec {e.section.sectionCode})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Attendance Rate"
          value={`${attendance?.attendancePercentage ?? 0}%`}
          subtitle="Present & late combined"
          icon={CalendarCheck}
          isLoading={loadingEnrollments || loadingAttendance}
        />
        <StatCard
          title="Classes Attended"
          value={attendance?.attendedClasses ?? 0}
          subtitle="Recorded sessions"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
          isLoading={loadingEnrollments || loadingAttendance}
        />
        <StatCard
          title="Total Classes"
          value={attendance?.totalClasses ?? 0}
          subtitle="Sessions held"
          icon={Clock}
          iconClassName="bg-sky-50 text-sky-600"
          isLoading={loadingEnrollments || loadingAttendance}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Log</CardTitle>
          <CardDescription>Date-by-date attendance history for the selected section.</CardDescription>
        </CardHeader>
        <CardContent>
          {!activeSectionId && !loadingEnrollments ? (
            <EmptyState
              title="No enrolled sections"
              description="Enroll in a section to track your attendance."
            />
          ) : loadingEnrollments || loadingAttendance ? (
            <Skeleton className="h-40 w-full" />
          ) : !attendance || attendance.records.length === 0 ? (
            <EmptyState
              title="No attendance records yet"
              description="Your instructor has not marked attendance for this section yet."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.records.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-slate-900">{formatDate(rec.date)}</span>
                  <div className="flex items-center gap-3">
                    {rec.remarks && <span className="text-xs text-slate-400">{rec.remarks}</span>}
                    <StatusBadge status={rec.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
