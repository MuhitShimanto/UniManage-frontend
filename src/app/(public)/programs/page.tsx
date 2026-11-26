import type { Metadata } from "next";
import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicApi } from "@/lib/server-api";
import type { Program } from "@/types/api";

export const metadata: Metadata = {
  title: "Academic Programs & Grading",
  description:
    "Explore accredited degree programs, credit requirements, and the official GPA grading scale.",
};

const GRADING_SCALE = [
  { grade: "A+", range: "80% – 100%", gp: "4.00" },
  { grade: "A", range: "75% – 79%", gp: "3.75" },
  { grade: "A-", range: "70% – 74%", gp: "3.50" },
  { grade: "B+", range: "65% – 69%", gp: "3.25" },
  { grade: "B", range: "60% – 64%", gp: "3.00" },
  { grade: "C+", range: "55% – 59%", gp: "2.50" },
  { grade: "C", range: "50% – 54%", gp: "2.25" },
  { grade: "D", range: "40% – 49%", gp: "2.00" },
  { grade: "F", range: "Below 40%", gp: "0.00" },
];

export default async function ProgramsPage() {
  const progRes = await fetchPublicApi<Program[]>("/programs");
  const programs = progRes?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Degree Programs & Grading Policy
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Accredited degree tracks and official credit-weighted CGPA calculation.
          </p>
        </div>
        <Link href="/register">
          <Button>
            <GraduationCap className="h-4 w-4" />
            Apply as Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {program.code}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {program.totalCreditsRequired} Credits Required
                </span>
              </div>
              <CardTitle className="mt-2">{program.name}</CardTitle>
              <CardDescription>
                {program.department ? `Department of ${program.department.name}` : "Accredited Degree Program"}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <CardTitle>Official University Grading Scale</CardTitle>
          </div>
          <CardDescription>
            Cumulative GPA is computed as a credit-weighted average across all published course results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 pr-4">Letter Grade</th>
                  <th className="py-2.5 pr-4">Score Range</th>
                  <th className="py-2.5">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {GRADING_SCALE.map((row) => (
                  <tr key={row.grade}>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-white">{row.grade}</td>
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{row.range}</td>
                    <td className="py-2.5 font-mono text-indigo-600 dark:text-indigo-400">{row.gp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
