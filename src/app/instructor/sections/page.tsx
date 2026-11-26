"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Section, User } from "@/types/api";

export default function InstructorSectionsPage() {
  const { data: me } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>("/users/me");
      return res.data.data;
    },
  });

  const instructorId = me?.instructorProfile?.id;

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["instructor-sections", instructorId],
    enabled: Boolean(instructorId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Section[]>>("/sections", {
        params: { instructorId },
      });
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assigned Sections</h1>
        <p className="text-sm text-slate-500">
          Select any section to manage attendance, gradebooks, or course syllabi.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
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
                  <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
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
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {section.scheduleSlot}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Room: {section.room || "TBA"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/instructor/attendance?sectionId=${section.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Attendance
                    </Button>
                  </Link>
                  <Link href={`/instructor/grades?sectionId=${section.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Grades
                    </Button>
                  </Link>
                  <Link href={`/instructor/sections/${section.id}`}>
                    <Button size="sm">
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
