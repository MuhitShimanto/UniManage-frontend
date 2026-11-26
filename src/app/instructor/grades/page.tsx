"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Section, SectionEnrollmentItem, User } from "@/types/api";

function InstructorGradesClient() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialSectionId = searchParams.get("sectionId") ?? "";

  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [gradesMap, setGradesMap] = useState<
    Record<
      string,
      {
        attendanceScore: number;
        assignmentScore: number;
        midtermScore: number;
        finalScore: number;
      }
    >
  >({});

  const { data: me } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => (await apiClient.get<ApiResponse<User>>("/users/me")).data.data,
  });

  const instructorId = me?.instructorProfile?.id;

  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["instructor-sections", instructorId],
    enabled: Boolean(instructorId),
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<Section[]>>("/sections", {
          params: { instructorId },
        })
      ).data.data,
  });

  const activeSectionId = selectedSectionId || sections[0]?.id || "";

  const { data: sectionDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["section-enrollments", activeSectionId],
    enabled: Boolean(activeSectionId),
    queryFn: async () =>
      (await apiClient.get<ApiResponse<Section>>(`/sections/${activeSectionId}/enrollments`)).data
        .data,
  });

  const enrollments: SectionEnrollmentItem[] = sectionDetail?.enrollments ?? [];

  const saveGradeMutation = useMutation({
    mutationFn: async (enrollment: SectionEnrollmentItem) => {
      const existing = enrollment.examResult;
      const draft = gradesMap[enrollment.id] ?? {
        attendanceScore: existing?.attendanceScore ?? 0,
        assignmentScore: existing?.assignmentScore ?? 0,
        midtermScore: existing?.midtermScore ?? 0,
        finalScore: existing?.finalScore ?? 0,
      };
      await apiClient.post("/results", {
        enrollmentId: enrollment.id,
        ...draft,
      });
    },
    onSuccess: () => {
      toast.success("Exam result saved!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", activeSectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save grade")),
  });

  const publishGradeMutation = useMutation({
    mutationFn: async (resultId: string) => {
      await apiClient.patch(`/results/${resultId}/publish`);
    },
    onSuccess: () => {
      toast.success("Grade published to student transcript!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", activeSectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to publish grade")),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Grades</h1>
          <p className="text-sm text-slate-500">
            Enter component scores and publish final grades to student transcripts.
          </p>
        </div>

        {sections.length > 0 && (
          <select
            value={activeSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            aria-label="Select section"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course.code} (Sec {s.sectionCode}) — {s.semester.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loadingSections || loadingDetail ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : !activeSectionId ? (
        <EmptyState
          title="No sections assigned"
          description="You do not have any assigned sections yet."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Section Gradebook</CardTitle>
            <CardDescription>
              Scores: Attendance (10), Assignment (20), Midterm (30), Final (40).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <EmptyState
                title="No enrolled students"
                description="Students will appear here once they enroll in this section."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 pr-3">Student</th>
                      <th className="py-2.5 pr-3">Att (10)</th>
                      <th className="py-2.5 pr-3">Asgn (20)</th>
                      <th className="py-2.5 pr-3">Mid (30)</th>
                      <th className="py-2.5 pr-3">Final (40)</th>
                      <th className="py-2.5 pr-3">Grade</th>
                      <th className="py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((enr) => {
                      const existing = enr.examResult;
                      const draft = gradesMap[enr.id] ?? {
                        attendanceScore: existing?.attendanceScore ?? 0,
                        assignmentScore: existing?.assignmentScore ?? 0,
                        midtermScore: existing?.midtermScore ?? 0,
                        finalScore: existing?.finalScore ?? 0,
                      };

                      const updateField = (field: keyof typeof draft, val: number) => {
                        setGradesMap((prev) => ({
                          ...prev,
                          [enr.id]: { ...draft, [field]: val },
                        }));
                      };

                      return (
                        <tr key={enr.id}>
                          <td className="py-3 pr-3">
                            <p className="font-medium">{enr.student.user.name}</p>
                            <p className="text-xs text-slate-500">{enr.student.studentCode}</p>
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={draft.attendanceScore}
                              onChange={(e) =>
                                updateField("attendanceScore", Number(e.target.value))
                              }
                              className="h-8 w-16 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              value={draft.assignmentScore}
                              onChange={(e) =>
                                updateField("assignmentScore", Number(e.target.value))
                              }
                              className="h-8 w-16 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={30}
                              value={draft.midtermScore}
                              onChange={(e) => updateField("midtermScore", Number(e.target.value))}
                              className="h-8 w-16 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={40}
                              value={draft.finalScore}
                              onChange={(e) => updateField("finalScore", Number(e.target.value))}
                              className="h-8 w-16 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-3">
                            {existing ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-indigo-600">{existing.grade}</span>
                                <StatusBadge status={existing.isPublished ? "PUBLISHED" : "DRAFT"} />
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Not saved</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={saveGradeMutation.isPending}
                                onClick={() => saveGradeMutation.mutate(enr)}
                              >
                                <Save className="h-3.5 w-3.5" />
                                Save
                              </Button>
                              {existing && !existing.isPublished && (
                                <Button
                                  size="sm"
                                  disabled={publishGradeMutation.isPending}
                                  onClick={() => publishGradeMutation.mutate(existing.id)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Publish
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function InstructorGradesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
      <InstructorGradesClient />
    </Suspense>
  );
}
