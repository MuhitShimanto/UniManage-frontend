"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, GitBranch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { useUrlParams } from "@/hooks/useUrlParams";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Course, Department } from "@/types/api";

export function CoursesCatalogClient() {
  const { searchParams, updateParams } = useUrlParams();

  const q = searchParams.get("q") ?? "";
  const departmentId = searchParams.get("departmentId") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const { data: departmentsRes } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Department[]>>("/departments");
      return res.data.data;
    },
  });

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["public-courses", q, departmentId, page],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Course[]>>("/courses", {
        params: {
          page,
          limit: 9,
          ...(q ? { q } : {}),
          ...(departmentId ? { departmentId } : {}),
        },
      });
      return res.data;
    },
  });

  const courses = coursesRes?.data ?? [];
  const meta = coursesRes?.meta;
  const departments = departmentsRes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <SearchInput
          value={q}
          onChange={(val) => updateParams({ q: val, page: 1 })}
          placeholder="Search by course code or title..."
          className="flex-1"
        />

        <select
          value={departmentId}
          onChange={(e) => updateParams({ departmentId: e.target.value, page: 1 })}
          aria-label="Filter by department"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.code} — {dept.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching courses"
          description="Try clearing your search or selecting a different department."
          action={
            (q || departmentId) && (
              <Button variant="outline" onClick={() => updateParams({ q: "", departmentId: "", page: 1 })}>
                Reset Filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {course.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {course.credits} Credits
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    {course.description || "Core academic course."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.department && (
                    <p className="text-xs text-slate-500">
                      Department: <strong className="text-slate-700 dark:text-slate-300">{course.department.name}</strong>
                    </p>
                  )}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>Prereqs:</span>
                      {course.prerequisites.map((p) => (
                        <span
                          key={p.id}
                          className="rounded bg-amber-50 px-1.5 py-0.5 font-medium dark:bg-amber-950/50"
                        >
                          {p.prerequisite.code}
                        </span>
                      ))}
                    </div>
                  )}
                  {course.syllabusUrl && (
                    <a
                      href={course.syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Download Syllabus PDF
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <span>
                Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} courses)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => updateParams({ page: meta.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => updateParams({ page: meta.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
