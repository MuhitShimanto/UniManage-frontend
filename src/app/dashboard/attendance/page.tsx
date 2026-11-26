"use client";

import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import { cn, formatDate } from "@/lib/utils";
import type { ApiResponse, Enrollment, StudentSectionAttendance } from "@/types/api";

export default function StudentAttendancePage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const { data: rawEnrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Enrollment[]>>("/enrollments/my");
      return res.data.data;
    },
  });

  const enrollments = rawEnrollments.filter(
    (e) => e.status !== "DROPPED" && Boolean(e.section?.semester?.isCurrent)
  );

  const sectionQueries = useQueries({
    queries: enrollments.map((e) => ({
      queryKey: ["my-attendance", e.sectionId],
      queryFn: async () => {
        const res = await apiClient.get<ApiResponse<StudentSectionAttendance>>(
          `/attendance/student/${e.sectionId}`
        );
        return res.data.data;
      },
    })),
  });

  const activeSectionId = selectedSectionId || enrollments[0]?.sectionId || "";
  const activeIndex = enrollments.findIndex((e) => e.sectionId === activeSectionId);
  const activeAttendance = activeIndex >= 0 ? sectionQueries[activeIndex]?.data : undefined;
  const loadingActive =
    loadingEnrollments || (activeIndex >= 0 && Boolean(sectionQueries[activeIndex]?.isLoading));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">
          Overview of your attendance across all enrolled sections and daily class logs.
        </p>
      </div>

      {/* All Sections Overview First */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          All Sections Overview
        </h2>
        {loadingEnrollments ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No enrolled sections"
            description="Enroll in a section to track your attendance."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enr, idx) => {
              const query = sectionQueries[idx];
              const data = query?.data;
              const isSelected = enr.sectionId === activeSectionId;
              const pct = data?.attendancePercentage ?? 0;

              return (
                <button
                  key={enr.sectionId}
                  type="button"
                  onClick={() => setSelectedSectionId(enr.sectionId)}
                  className="text-left"
                >
                  <Card
                    interactive
                    className={cn(
                      "h-full transition-all",
                      isSelected && "border-indigo-500 ring-2 ring-indigo-500/20"
                    )}
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-indigo-600">
                            {enr.section.course.code} • Sec {enr.section.sectionCode}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-900">
                            {enr.section.course.title}
                          </p>
                        </div>
                        {query?.isLoading ? (
                          <Skeleton className="h-6 w-12" />
                        ) : (
                          <span className="text-base font-bold text-slate-900">{pct}%</span>
                        )}
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct >= 75
                              ? "bg-emerald-500"
                              : pct >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-500">
                        {query?.isLoading
                          ? "Loading..."
                          : `${data?.attendedClasses ?? 0} of ${data?.totalClasses ?? 0} classes attended`}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Section Details */}
      {activeSectionId && (
        <div className="space-y-4 border-t border-slate-200/80 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Selected Section — {enrollments[activeIndex]?.section.course.code} (Sec{" "}
            {enrollments[activeIndex]?.section.sectionCode})
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Attendance Rate"
              value={`${activeAttendance?.attendancePercentage ?? 0}%`}
              subtitle="Present & late combined"
              icon={CalendarCheck}
              isLoading={loadingActive}
            />
            <StatCard
              title="Classes Attended"
              value={activeAttendance?.attendedClasses ?? 0}
              subtitle="Recorded sessions"
              icon={CheckCircle2}
              iconClassName="bg-emerald-50 text-emerald-600"
              isLoading={loadingActive}
            />
            <StatCard
              title="Total Classes"
              value={activeAttendance?.totalClasses ?? 0}
              subtitle="Sessions held"
              icon={Clock}
              iconClassName="bg-sky-50 text-sky-600"
              isLoading={loadingActive}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Attendance Log — {enrollments[activeIndex]?.section.course.code} (Sec{" "}
                {enrollments[activeIndex]?.section.sectionCode})
              </CardTitle>
              <CardDescription>
                Date-by-date attendance history for the selected section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActive ? (
                <Skeleton className="h-40 w-full" />
              ) : !activeAttendance || activeAttendance.records.length === 0 ? (
                <EmptyState
                  title="No attendance records yet"
                  description="Your instructor has not marked attendance for this section yet."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeAttendance.records.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-slate-900">{formatDate(rec.date)}</span>
                      <div className="flex items-center gap-3">
                        {rec.remarks && (
                          <span className="text-xs text-slate-400">{rec.remarks}</span>
                        )}
                        <StatusBadge status={rec.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
