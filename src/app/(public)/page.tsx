import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BlurText } from "@/components/animations/BlurText";
import { CountUp } from "@/components/animations/CountUp";
import { AnimatedContent } from "@/components/animations/AnimatedContent";
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
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/60 via-white/40 to-transparent py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Fall 2026 Admissions & Registration Open
            </span>
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              <BlurText text="One Unified Portal for" className="justify-center" />{" "}
              <BlurText
                text="Academic Excellence"
                delay={70}
                className="justify-center text-indigo-600"
              />
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
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

          {/* Metric-First Snapshot Strip */}
          <AnimatedContent delay={150} className="mt-14 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-end justify-between p-6">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    01 / Departments
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    <CountUp to={departments.length || 2} suffix={departments.length ? "" : "+"} />
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Academic Faculties</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  Active
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-end justify-between p-6">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    02 / Degree Tracks
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    <CountUp to={programs.length || 2} suffix={programs.length ? "" : "+"} />
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Accredited Programs</p>
                </div>
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700">
                  4.00 Scale
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-end justify-between p-6">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    03 / Curriculum
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    <CountUp
                      to={courseRes?.meta?.total ?? (courses.length || 10)}
                      suffix={courseRes?.meta?.total || courses.length ? "" : "+"}
                    />
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Catalog Courses</p>
                </div>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
                  Live API
                </span>
              </CardContent>
            </Card>
          </AnimatedContent>
        </div>
      </section>

      {/* Bento UI-Preview Role Portals */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Role-Based Architecture
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Built for Every Campus Workflow
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Try One-Click Demo Login
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <AnimatedContent delay={100} className="grid gap-5 md:grid-cols-12">
            {/* Student Bento Card (7 cols) */}
            <Card className="flex flex-col justify-between md:col-span-7">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-7">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      STUDENT PORTAL
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      /dashboard
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Self-Service Registration & Tuition
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Enroll in open sections with automatic prerequisite & 18-credit limit checks,
                    inspect attendance, download transcripts, and settle tuition via SSLCommerz.
                  </p>
                </div>

                {/* Mini UI Preview */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Semester Credit Load</span>
                    <span className="font-mono font-semibold text-indigo-600">12 / 18 Credits</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-2/3 rounded-full bg-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">CSE201</span>
                      <span className="ml-2 text-slate-500">Data Structures • Sec A</span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ENROLLED
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Bento Card (5 cols) */}
            <Card className="flex flex-col justify-between md:col-span-5">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-7">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-600">
                      FACULTY PORTAL
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      /instructor
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Bulk Attendance & Gradebooks
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Record section-wide attendance in one click, compute weighted scores, publish
                    official grades, and upload Cloudinary syllabus PDFs.
                  </p>
                </div>

                {/* Mini UI Preview */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-xs">
                    <span className="font-medium text-slate-700">Ada Lovelace</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">94% Att</span>
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700">
                        A+
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Transcript Synced
                    </span>
                    <span className="font-mono">POST /attendance/bulk</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Bento Card (12 cols horizontal) */}
            <Card className="md:col-span-12">
              <CardContent className="grid items-center gap-6 p-6 sm:p-7 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-purple-600">
                      REGISTRAR & ADMIN
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      /admin
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Campus Governance, Analytics & Audit Logs
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Create departments, programs, semesters, and courses via a 3-step prerequisite
                    wizard. Manage faculty accounts, generate fee invoices, and monitor revenue.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                    <p className="font-mono text-[10px] uppercase text-slate-400">Course Wizard</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">3-Step Builder</p>
                    <p className="mt-1 text-xs text-slate-500">Info → Dept → Prereqs</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                    <p className="font-mono text-[10px] uppercase text-slate-400">Settlements</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">SSLCommerz Live</p>
                    <p className="mt-1 text-xs text-slate-500">BDT Invoice Tracking</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                    <p className="font-mono text-[10px] uppercase text-slate-400">Security</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Immutable Logs</p>
                    <p className="mt-1 text-xs text-slate-500">Every Mutation Audited</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContent>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="border-t border-slate-200/80 bg-white/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Curriculum
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Featured Courses
                </h2>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  View All Courses
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col justify-between">
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {course.code}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {course.credits} Credits
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-900">{course.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                        {course.description || "Core curriculum course."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                      <span>{course.department?.code ?? "General"}</span>
                      <Link
                        href={`/courses?q=${encodeURIComponent(course.code)}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        Inspect →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
