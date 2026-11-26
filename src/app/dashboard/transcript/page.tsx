"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, Enrollment, StudentSectionAttendance, Transcript } from "@/types/api";

export default function TranscriptAndAttendancePage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const { data: transcript, isLoading: loadingTranscript } = useQuery({
    queryKey: ["my-transcript"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Transcript>>("/transcripts/me");
      return res.data.data;
    },
  });

  const { data: enrollments = [] } = useQuery({
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Academic Transcript & Attendance
        </h1>
        <p className="text-sm text-slate-500">
          View published course grades, cumulative GPA, and section-wise attendance logs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Cumulative GPA"
          value={transcript?.cumulativeCgpa?.toFixed(2) ?? "0.00"}
          subtitle={
            transcript?.student?.studentCode
              ? `Student Code: ${transcript.student.studentCode}`
              : undefined
          }
          icon={Award}
          isLoading={loadingTranscript}
        />
        <StatCard
          title="Total Credits Earned"
          value={transcript?.totalCreditsCompleted ?? 0}
          subtitle="From published course results"
          icon={CalendarCheck}
          iconClassName="bg-emerald-50 text-emerald-600"
          isLoading={loadingTranscript}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Grades</CardTitle>
          <CardDescription>Official transcript courses grouped by semester</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTranscript ? (
            <Skeleton className="h-40 w-full" />
          ) : !transcript || (transcript.semesters?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Award}
              title="No published grades yet"
              description="Your grades will appear here once instructors publish your final exam results."
            />
          ) : (
            <div className="space-y-6">
              {transcript.semesters.map((sem) => (
                <div key={sem.semesterName} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3.5 py-2 text-sm">
                    <span className="font-semibold text-slate-900">{sem.semesterName}</span>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>
                        Semester GPA: <strong className="text-indigo-600">{sem.semesterGpa.toFixed(2)}</strong>
                      </span>
                      <span>
                        Credits: <strong>{sem.creditsEarned}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="py-2.5 pr-4">Course</th>
                          <th className="py-2.5 pr-4">Credits</th>
                          <th className="py-2.5 pr-4">Score</th>
                          <th className="py-2.5 pr-4">Grade</th>
                          <th className="py-2.5">GP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sem.courses.map((c) => (
                          <tr key={c.code}>
                            <td className="py-3 pr-4 font-medium">
                              {c.code} — {c.title}
                            </td>
                            <td className="py-3 pr-4">{c.credits}</td>
                            <td className="py-3 pr-4">{c.totalScore}</td>
                            <td className="py-3 pr-4 font-semibold text-indigo-600">{c.grade}</td>
                            <td className="py-3 font-mono">{c.gradePoint.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Section Attendance</CardTitle>
            <CardDescription>Select an enrolled section to inspect attendance.</CardDescription>
          </div>
          {enrollments.length > 0 && (
            <select
              value={activeSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              aria-label="Select section for attendance"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {enrollments.map((e) => (
                <option key={e.sectionId} value={e.sectionId}>
                  {e.section.course.code} (Sec {e.section.sectionCode})
                </option>
              ))}
            </select>
          )}
        </CardHeader>
        <CardContent>
          {!activeSectionId ? (
            <EmptyState
              title="No enrolled sections"
              description="Enroll in a section to track your attendance."
            />
          ) : loadingAttendance ? (
            <Skeleton className="h-36 w-full" />
          ) : !attendance || attendance.records.length === 0 ? (
            <EmptyState
              title="No attendance records yet"
              description="Your instructor has not marked attendance for this section yet."
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-950">
                <span>
                  Total Classes: <strong>{attendance.totalClasses}</strong>
                </span>
                <span>
                  Attended: <strong>{attendance.attendedClasses}</strong>
                </span>
                <span>
                  Percentage:{" "}
                  <strong className="text-indigo-600">{attendance.attendancePercentage}%</strong>
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.records.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{formatDate(rec.date)}</span>
                    <div className="flex items-center gap-3">
                      {rec.remarks && <span className="text-xs text-slate-400">{rec.remarks}</span>}
                      <StatusBadge status={rec.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
