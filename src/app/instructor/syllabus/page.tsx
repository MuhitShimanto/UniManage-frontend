"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Section, User } from "@/types/api";

export default function InstructorSyllabusPage() {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const { data: me } = useQuery({
    queryKey: ["users-me"],
    queryFn: async () => (await apiClient.get<ApiResponse<User>>("/users/me")).data.data,
  });

  const instructorId = me?.instructorProfile?.id;

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["instructor-sections", instructorId],
    enabled: Boolean(instructorId),
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<Section[]>>("/sections", {
          params: { instructorId },
        })
      ).data.data,
  });

  const activeSection = sections.find((s) => s.id === selectedSectionId) ?? sections[0];

  const syllabusMutation = useMutation({
    mutationFn: async ({ courseId, file }: { courseId: string; file: File }) => {
      const formData = new FormData();
      formData.append("syllabus", file);
      await apiClient.patch(`/courses/${courseId}/syllabus`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Syllabus PDF uploaded to Cloudinary!");
      queryClient.invalidateQueries({ queryKey: ["instructor-sections", instructorId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to upload syllabus")),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Syllabus</h1>
          <p className="text-sm text-slate-500">
            Upload and manage official PDF syllabi for your courses.
          </p>
        </div>

        {sections.length > 0 && (
          <select
            value={activeSection?.id ?? ""}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            aria-label="Select section"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course.code} (Sec {s.sectionCode}) — {s.course.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-2xl" />
      ) : !activeSection ? (
        <EmptyState
          title="No courses assigned"
          description="You do not have any assigned sections yet."
        />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>
              {activeSection.course.code} — {activeSection.course.title}
            </CardTitle>
            <CardDescription>Upload a PDF syllabus stored securely on Cloudinary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSection.course.syllabusUrl ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Current Syllabus PDF
                </span>
                <a
                  href={activeSection.course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  View PDF →
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No syllabus uploaded for this course yet.</p>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
              <FileUp className="h-4 w-4 text-indigo-600" />
              {syllabusMutation.isPending ? "Uploading PDF..." : "Upload Syllabus PDF"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={syllabusMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    syllabusMutation.mutate({ courseId: activeSection.course.id, file });
                  }
                }}
              />
            </label>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
