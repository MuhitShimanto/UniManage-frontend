"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, CheckCircle2, FileUp, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, AttendanceStatus, Section, SectionEnrollmentItem } from "@/types/api";

type TabType = "attendance" | "gradebook" | "syllabus";

export default function InstructorSectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sectionId } = use(params);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("attendance");
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});
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

  const { data: section, isLoading } = useQuery({
    queryKey: ["section-enrollments", sectionId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Section>>(`/sections/${sectionId}/enrollments`);
      return res.data.data;
    },
  });

  const enrollments: SectionEnrollmentItem[] = section?.enrollments ?? [];

  const bulkAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = enrollments.map((e) => ({
        enrollmentId: e.id,
        status: attendanceMap[e.id]?.status ?? "PRESENT",
        remarks: attendanceMap[e.id]?.remarks || undefined,
      }));
      await apiClient.post("/attendance/bulk", {
        sectionId,
        date: attendanceDate,
        records,
      });
    },
    onSuccess: () => {
      toast.success("Bulk attendance saved!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", sectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save attendance")),
  });

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
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", sectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save grade")),
  });

  const publishGradeMutation = useMutation({
    mutationFn: async (resultId: string) => {
      await apiClient.patch(`/results/${resultId}/publish`);
    },
    onSuccess: () => {
      toast.success("Grade published to student transcript!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", sectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to publish grade")),
  });

  const syllabusMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!section) return;
      const formData = new FormData();
      formData.append("syllabus", file);
      await apiClient.patch(`/courses/${section.course.id}/syllabus`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Syllabus PDF uploaded to Cloudinary!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", sectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to upload syllabus")),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (!section) {
    return (
      <EmptyState
        title="Section not found"
        description="This section could not be loaded."
        action={
          <Link href="/instructor">
            <Button variant="outline">Back to Sections</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/instructor"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Sections
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {section.course.code} (Section {section.sectionCode}) — {section.course.title}
          </h1>
          <p className="text-sm text-slate-500">
            {section.semester.name} • {section.scheduleSlot} • {enrollments.length} Students
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {(
          [
            { key: "attendance", label: "Bulk Attendance" },
            { key: "gradebook", label: "Gradebook & Publishing" },
            { key: "syllabus", label: "Course Syllabus" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "attendance" && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mark Bulk Attendance</CardTitle>
              <CardDescription>Select a class date and record student attendance.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-auto"
              />
              <Button
                disabled={enrollments.length === 0 || bulkAttendanceMutation.isPending}
                onClick={() => bulkAttendanceMutation.mutate()}
              >
                <CalendarCheck className="h-4 w-4" />
                {bulkAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <EmptyState
                title="No enrolled students"
                description="Students will appear here once they enroll in this section."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments.map((enr) => {
                  const current = attendanceMap[enr.id] ?? { status: "PRESENT" as AttendanceStatus, remarks: "" };
                  return (
                    <div
                      key={enr.id}
                      className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {enr.student.user.name}
                        </p>
                        <p className="text-xs text-slate-500">{enr.student.studentCode}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div
                          role="radiogroup"
                          aria-label={`Attendance status for ${enr.student.user.name}`}
                          className="inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5"
                        >
                          {(
                            [
                              {
                                value: "PRESENT",
                                label: "Present",
                                activeClass: "bg-emerald-600 text-white shadow-xs",
                              },
                              {
                                value: "LATE",
                                label: "Late",
                                activeClass: "bg-amber-500 text-white shadow-xs",
                              },
                              {
                                value: "ABSENT",
                                label: "Absent",
                                activeClass: "bg-rose-600 text-white shadow-xs",
                              },
                            ] as const
                          ).map((opt) => {
                            const checked = current.status === opt.value;
                            return (
                              <label
                                key={opt.value}
                                className={`cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all select-none ${
                                  checked
                                    ? opt.activeClass
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`attendance-${enr.id}`}
                                  value={opt.value}
                                  checked={checked}
                                  onChange={() =>
                                    setAttendanceMap((prev) => ({
                                      ...prev,
                                      [enr.id]: { ...current, status: opt.value },
                                    }))
                                  }
                                  className="sr-only"
                                />
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                        <Input
                          placeholder="Remarks (optional)"
                          value={current.remarks}
                          onChange={(e) =>
                            setAttendanceMap((prev) => ({
                              ...prev,
                              [enr.id]: { ...current, remarks: e.target.value },
                            }))
                          }
                          className="h-9 w-48 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "gradebook" && (
        <Card>
          <CardHeader>
            <CardTitle>Section Gradebook</CardTitle>
            <CardDescription>
              Enter scores (Attendance 10, Assignment 20, Midterm 30, Final 40) and publish grades.
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
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                              onChange={(e) => updateField("attendanceScore", Number(e.target.value))}
                              className="h-8 w-16 text-xs"
                            />
                          </td>
                          <td className="py-3 pr-2">
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              value={draft.assignmentScore}
                              onChange={(e) => updateField("assignmentScore", Number(e.target.value))}
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

      {activeTab === "syllabus" && (
        <Card>
          <CardHeader>
            <CardTitle>Course Syllabus PDF</CardTitle>
            <CardDescription>
              Upload or replace the official syllabus PDF for {section.course.code}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.course.syllabusUrl && (
              <p className="text-sm">
                Current Syllabus:{" "}
                <a
                  href={section.course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  View Uploaded PDF →
                </a>
              </p>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <FileUp className="h-4 w-4 text-indigo-600" />
              {syllabusMutation.isPending ? "Uploading PDF..." : "Upload Syllabus PDF"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={syllabusMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) syllabusMutation.mutate(file);
                }}
              />
            </label>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
