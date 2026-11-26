import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicApi } from "@/lib/server-api";
import type { Course, Department, Program } from "@/types/api";

export const metadata: Metadata = {
  title: "Home — Modern University Management System",
  description:
    "Explore degree programs, browse courses, register for semesters, track attendance and transcripts, and pay tuition securely.",
};

export default async function HomePage() {
  const [deptRes, progRes, courseRes] = await Promise.all([
    fetchPublicApi<Department[]>("/departments"),
    fetchPublicApi<Program[]>("/programs"),
    fetchPublicApi<Course[]>("/courses?limit=6"),
  ]);

  const departments = deptRes?.data ?? [];
  const programs = progRes?.data ?? [];
  const courses = courseRes?.data ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/70 via-white to-white py-16 sm:py-24 dark:border-slate-800 dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
              <GraduationCap className="h-3.5 w-3.5" />
              Fall 2026 Admissions & Registration Open
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              One Unified Portal for{" "}
              <span className="text-indigo-600 dark:text-indigo-400">Academic Excellence</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Streamline course enrollment with prerequisite checks, real-time attendance,
              faculty gradebooks, official GPA transcripts, and SSLCommerz tuition payments.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login">
                <Button size="lg">
                  Launch Demo Portal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  Browse Course Catalog
                </Button>
              </Link>
            </div>
          </div>

          {/* Live Academic Snapshot */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {departments.length || "2+"}
                  </p>
                  <p className="text-sm text-slate-500">Academic Departments</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {programs.length || "2+"}
                  </p>
                  <p className="text-sm text-slate-500">Accredited Programs</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {courseRes?.meta?.total ?? (courses.length || "10+")}
                  </p>
                  <p className="text-sm text-slate-500">Active Courses</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3 Role Portals */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for Every Campus Role
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Try any role instantly with one-click demo login on the sign-in page.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>
                  Enroll in sections, verify prerequisites, track attendance, view transcripts, and pay tuition via SSLCommerz.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 18-Credit Semester Limit Enforcement</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Live CGPA & Official Transcript</p>
                <p className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-500" /> Online Tuition Checkout</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle>Instructor Portal</CardTitle>
                <CardDescription>
                  Manage assigned sections, mark bulk daily attendance, upload syllabi, and publish final exam grades.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Bulk Roster Attendance Marking</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Weighted Score & Grade Publishing</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cloudinary Syllabus PDF Uploads</p>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle>Registrar & Admin Portal</CardTitle>
                <CardDescription>
                  Oversee departments, programs, courses, semesters, faculty accounts, fee invoices, and audit logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time Revenue & Enrollment Charts</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-Step Course & Prereq Wizard</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Full System Audit Trail</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50/60 py-16 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Featured Courses
                </h2>
                <p className="text-sm text-slate-500">Live from the university curriculum</p>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  View All Courses
                </Button>
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.credits} Credits
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-base">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description || "Core curriculum course."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
