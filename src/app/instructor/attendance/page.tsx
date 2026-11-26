"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, AttendanceStatus, Section, SectionEnrollmentItem, User } from "@/types/api";

function InstructorAttendanceClient() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialSectionId = searchParams.get("sectionId") ?? "";

  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const [subTab, setSubTab] = useState<"submit" | "history">("submit");
  const [selectedHistoryDate, setSelectedHistoryDate] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
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

  const enrollments: SectionEnrollmentItem[] = useMemo(
    () => sectionDetail?.enrollments ?? [],
    [sectionDetail]
  );

  // Group previous attendance records by date
  const historyByDate = useMemo(() => {
    const map = new Map<
      string,
      Array<{ studentName: string; studentCode: string; status: AttendanceStatus; remarks?: string | null }>
    >();
    for (const enr of enrollments) {
      for (const rec of enr.attendances ?? []) {
        const key = rec.date.split("T")[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({
          studentName: enr.student.user.name,
          studentCode: enr.student.studentCode,
          status: rec.status,
          remarks: rec.remarks,
        });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [enrollments]);

  const bulkAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = enrollments.map((e) => ({
        enrollmentId: e.id,
        status: attendanceMap[e.id]?.status ?? "PRESENT",
        remarks: attendanceMap[e.id]?.remarks || undefined,
      }));
      await apiClient.post("/attendance/bulk", {
        sectionId: activeSectionId,
        date: attendanceDate,
        records,
      });
    },
    onSuccess: () => {
      toast.success("Bulk attendance saved!");
      queryClient.invalidateQueries({ queryKey: ["section-enrollments", activeSectionId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save attendance")),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">
            Submit daily section attendance or review previously recorded sessions.
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

      <div className="flex gap-2 border-b border-slate-200">
        {(
          [
            { key: "submit", label: "Submit Attendance" },
            { key: "history", label: `Previous Sessions (${historyByDate.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSubTab(t.key)}
            className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium ${
              subTab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadingSections || loadingDetail ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : !activeSectionId ? (
        <EmptyState
          title="No sections assigned"
          description="You do not have any assigned sections yet."
        />
      ) : subTab === "submit" ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mark Bulk Attendance</CardTitle>
              <CardDescription>Select a class date and mark student status.</CardDescription>
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
              <div className="divide-y divide-slate-100">
                {enrollments.map((enr) => {
                  const current = attendanceMap[enr.id] ?? {
                    status: "PRESENT" as AttendanceStatus,
                    remarks: "",
                  };
                  return (
                    <div
                      key={enr.id}
                      className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{enr.student.user.name}</p>
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
                                className={`cursor-pointer select-none rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
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
      ) : historyByDate.length === 0 ? (
        <EmptyState
          title="No previous attendance"
          description="Submitted attendance sessions for this section will appear here."
        />
      ) : (
        (() => {
          const activeEntry =
            historyByDate.find(([d]) => d === selectedHistoryDate) ?? historyByDate[0];
          const [activeDateKey, entries] = activeEntry;

          return (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">{formatDate(activeDateKey)}</CardTitle>
                  <CardDescription>{entries.length} student records</CardDescription>
                </div>
                <select
                  value={activeDateKey}
                  onChange={(e) => setSelectedHistoryDate(e.target.value)}
                  aria-label="Select session date"
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  {historyByDate.map(([dateKey]) => (
                    <option key={dateKey} value={dateKey}>
                      {formatDate(dateKey)}
                    </option>
                  ))}
                </select>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <div
                    key={`${activeDateKey}-${entry.studentCode}`}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{entry.studentName}</p>
                      <p className="text-xs text-slate-500">{entry.studentCode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.remarks && (
                        <span className="text-xs text-slate-400">{entry.remarks}</span>
                      )}
                      <StatusBadge status={entry.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })()
      )}
    </div>
  );
}

export default function InstructorAttendancePage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
      <InstructorAttendanceClient />
    </Suspense>
  );
}
