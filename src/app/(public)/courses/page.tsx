import type { Metadata } from "next";
import { Suspense } from "react";
import { CoursesCatalogClient } from "@/components/public/CoursesCatalogClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Course Catalog",
  description:
    "Browse university courses, filter by department, inspect prerequisites, and download course syllabi.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Course Catalog
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Search and filter university courses with live prerequisite and syllabus details.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <CoursesCatalogClient />
      </Suspense>
    </div>
  );
}
