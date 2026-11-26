"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Transcript } from "@/types/api";

export default function StudentTranscriptPage() {
  const { data: transcript, isLoading } = useQuery({
    queryKey: ["my-transcript"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Transcript>>("/transcripts/me");
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Academic Transcript
        </h1>
        <p className="text-sm text-slate-500">
          View your official published course grades and cumulative GPA.
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
          isLoading={isLoading}
        />
        <StatCard
          title="Total Credits Earned"
          value={transcript?.totalCreditsCompleted ?? 0}
          subtitle="From published course results"
          icon={BookOpen}
          iconClassName="bg-emerald-50 text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Grades</CardTitle>
          <CardDescription>Official transcript courses grouped by semester</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                        Semester GPA:{" "}
                        <strong className="text-indigo-600">{sem.semesterGpa.toFixed(2)}</strong>
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
    </div>
  );
}
