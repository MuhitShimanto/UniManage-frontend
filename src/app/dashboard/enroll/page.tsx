"use client";

import { Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, Check, ChevronDown, ChevronUp, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUrlParams } from "@/hooks/useUrlParams";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Enrollment, Section, Semester } from "@/types/api";

function parseScheduleSlot(slot: string): { days: string[]; startMin: number; endMin: number } | null {
  const match = slot
    .trim()
    .toUpperCase()
    .match(/^([A-Z-]+)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const days = match[1].split("-").filter(Boolean);
  const startMin = Number(match[2]) * 60 + Number(match[3]);
  const endMin = Number(match[4]) * 60 + Number(match[5]);
  if (Number.isNaN(startMin) || Number.isNaN(endMin) || startMin >= endMin) return null;

  return { days, startMin, endMin };
}

function hasScheduleClash(slotA: string, slotB: string): boolean {
  if (slotA.trim().toUpperCase() === slotB.trim().toUpperCase()) return true;
  const a = parseScheduleSlot(slotA);
  const b = parseScheduleSlot(slotB);
  if (!a || !b) return false;

  const sharesDay = a.days.some((d) => b.days.includes(d));
  if (!sharesDay) return false;

  return a.startMin < b.endMin && b.startMin < a.endMin;
}

function EnrollClient() {
  const queryClient = useQueryClient();
  const { searchParams, updateParams } = useUrlParams();
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const semesterId = searchParams.get("semesterId") ?? "";
  const q = searchParams.get("q") ?? "";

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Semester[]>>("/semesters");
      return res.data.data;
    },
  });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["sections", semesterId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Section[]>>("/sections", {
        params: semesterId ? { semesterId } : {},
      });
      return res.data.data;
    },
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Enrollment[]>>("/enrollments/my");
      return res.data.data;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      await apiClient.post("/enrollments", { sectionId });
    },
    onSuccess: () => {
      toast.success("Successfully enrolled in section!");
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not enroll in section"));
    },
  });

  const enrolledSectionIds = new Set(
    myEnrollments.filter((e) => e.status === "ENROLLED").map((e) => e.sectionId)
  );
  const completedCourseIds = new Set(
    myEnrollments
      .filter((e) => e.status === "COMPLETED" && (e.examResult ? e.examResult.gradePoint > 0 : true))
      .map((e) => e.section.courseId)
  );

  // Group filtered sections by course
  const courseGroups = useMemo(() => {
    const filtered = sections.filter((s) => {
      if (!q) return true;
      const term = q.toLowerCase();
      return (
        s.course.code.toLowerCase().includes(term) ||
        s.course.title.toLowerCase().includes(term) ||
        s.instructor.user.name.toLowerCase().includes(term)
      );
    });

    const map = new Map<
      string,
      {
        course: Section["course"];
        sections: Section[];
      }
    >();

    for (const sec of filtered) {
      if (!map.has(sec.courseId)) {
        map.set(sec.courseId, { course: sec.course, sections: [] });
      }
      map.get(sec.courseId)!.sections.push(sec);
    }

    return Array.from(map.values()).sort((a, b) => a.course.code.localeCompare(b.course.code));
  }, [sections, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Registration</h1>
        <p className="text-sm text-slate-500">
          Browse available courses and expand any course to view and enroll in its open sections.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <SearchInput
          value={q}
          onChange={(val) => updateParams({ q: val })}
          placeholder="Filter by course code, title, or instructor..."
          className="flex-1"
        />
        <select
          value={semesterId}
          onChange={(e) => updateParams({ semesterId: e.target.value })}
          aria-label="Filter by semester"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name} {sem.isCurrent ? "(Current)" : ""}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : courseGroups.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses available"
          description="No courses or sections match your current filter."
        />
      ) : (
        <div className="space-y-4">
          {courseGroups.map(({ course, sections: courseSections }) => {
            const isExpanded = expandedCourseId === course.id;
            const isCourseCompleted = completedCourseIds.has(course.id);
            const isCourseEnrolled = courseSections.some((s) => enrolledSectionIds.has(s.id));

            return (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.credits} Credits • {courseSections.length}{" "}
                        {courseSections.length === 1 ? "Section" : "Sections"}
                      </span>
                      {isCourseCompleted && <StatusBadge status="COMPLETED" />}
                      {!isCourseCompleted && isCourseEnrolled && <StatusBadge status="ENROLLED" />}
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </div>

                  <Button
                    variant={isExpanded ? "secondary" : "outline"}
                    size="sm"
                    onClick={() =>
                      setExpandedCourseId((prev) => (prev === course.id ? null : course.id))
                    }
                  >
                    {isExpanded ? (
                      <>
                        Hide Sections
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View Sections ({courseSections.length})
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-slate-100 bg-slate-50/50 pt-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      {courseSections.map((section) => {
                        const isEnrolled = enrolledSectionIds.has(section.id);
                        const clashingEnrollment = myEnrollments.find(
                          (e) =>
                            e.status === "ENROLLED" &&
                            e.section.semesterId === section.semesterId &&
                            e.sectionId !== section.id &&
                            hasScheduleClash(e.section.scheduleSlot, section.scheduleSlot)
                        );
                        const isFull = section.enrolledCount >= section.maxCapacity;
                        const seatsPercent = Math.min(
                          100,
                          Math.round((section.enrolledCount / section.maxCapacity) * 100)
                        );

                        return (
                          <Card key={section.id} interactive className="flex flex-col justify-between bg-white">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900">
                                  Section {section.sectionCode}
                                </span>
                                <StatusBadge
                                  status={section.semester.registrationOpen ? "ACTIVE" : "DROPPED"}
                                />
                              </div>
                              <CardDescription>{section.semester.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-1.5 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  {section.instructor.user.name} ({section.instructor.designation})
                                </p>
                                <p className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {section.scheduleSlot}
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                  Room: {section.room || "TBA"}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Seat Capacity</span>
                                  <span className="font-medium">
                                    {section.enrolledCount} / {section.maxCapacity}
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-indigo-600 transition-all"
                                    style={{ width: `${seatsPercent}%` }}
                                  />
                                </div>
                              </div>

                              <Button
                                className="w-full"
                                disabled={
                                  isEnrolled ||
                                  isCourseCompleted ||
                                  Boolean(clashingEnrollment) ||
                                  isFull ||
                                  !section.semester.registrationOpen ||
                                  enrollMutation.isPending
                                }
                                variant={isEnrolled || isCourseCompleted ? "secondary" : "default"}
                                onClick={() => enrollMutation.mutate(section.id)}
                              >
                                {isEnrolled ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Already Enrolled
                                  </>
                                ) : isCourseCompleted ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Already Completed
                                  </>
                                ) : clashingEnrollment ? (
                                  `Time Clash (${clashingEnrollment.section.course.code})`
                                ) : isFull ? (
                                  "Section Full"
                                ) : !section.semester.registrationOpen ? (
                                  "Registration Closed"
                                ) : (
                                  "Enroll in Section"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <EnrollClient />
    </Suspense>
  );
}
