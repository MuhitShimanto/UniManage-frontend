import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

const PORTALS = [
  {
    eyebrow: "Student Portal",
    title: "Course Registration & Tuition",
    description:
      "Enroll in open sections with automatic prerequisite and 18-credit limit checks, track attendance, view transcripts, and pay tuition via SSLCommerz.",
    href: "/login",
    cta: "Open Student Portal",
    accent: "border-t-2 border-t-indigo-600",
  },
  {
    eyebrow: "Faculty Portal",
    title: "Attendance & Gradebooks",
    description:
      "Manage assigned sections, mark bulk daily attendance, upload course syllabi, and publish weighted final grades directly to student transcripts.",
    href: "/login",
    cta: "Open Faculty Portal",
    accent: "border-t-2 border-t-sky-600",
  },
  {
    eyebrow: "Admin & Registrar",
    title: "Governance & Analytics",
    description:
      "Oversee departments, programs, semesters, and courses with a multi-step prerequisite builder, faculty onboarding, fee invoices, and audit logs.",
    href: "/login",
    cta: "Open Admin Console",
    accent: "border-t-2 border-t-slate-900",
  },
];

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

          {/* Clean Minimalist Metrics */}
          <AnimatedContent delay={150} className="mt-14 grid gap-6 sm:grid-cols-3">
            <Card className="border-l-2 border-l-indigo-600">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Academic Departments
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  <CountUp to={departments.length || 2} suffix={departments.length ? "" : "+"} />
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-2 border-l-emerald-600">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Accredited Programs
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  <CountUp to={programs.length || 2} suffix={programs.length ? "" : "+"} />
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-2 border-l-sky-600">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Courses
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  <CountUp
                    to={courseRes?.meta?.total ?? (courses.length || 10)}
                    suffix={courseRes?.meta?.total || courses.length ? "" : "+"}
                  />
                </p>
              </CardContent>
            </Card>
          </AnimatedContent>
        </div>
      </section>

      {/* Clean Minimalist Role Portals */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Built for Every Campus Role
            </h2>
            <p className="mt-2 text-slate-600">
              Dedicated workspaces for students, faculty, and university administrators.
            </p>
          </div>

          <AnimatedContent delay={100} className="grid gap-6 md:grid-cols-3">
            {PORTALS.map((portal) => (
              <Card key={portal.eyebrow} className={`flex flex-col justify-between ${portal.accent}`}>
                <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {portal.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{portal.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {portal.description}
                    </p>
                  </div>
                  <Link
                    href={portal.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {portal.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </AnimatedContent>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="border-t border-slate-200/80 bg-white/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Courses</h2>
                <p className="mt-1 text-sm text-slate-500">Live from the university curriculum</p>
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
                <Card key={course.id} className="border-t-2 border-t-slate-200 hover:border-t-indigo-500">
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-600">{course.code}</span>
                        <span className="text-slate-500">{course.credits} Credits</span>
                      </div>
                      <h3 className="mt-2.5 text-base font-bold text-slate-900">{course.title}</h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                        {course.description || "Core curriculum course."}
                      </p>
                    </div>
                    <Link
                      href={`/courses?q=${encodeURIComponent(course.code)}`}
                      className="text-xs font-semibold text-slate-700 hover:text-indigo-600"
                    >
                      View Course Details →
                    </Link>
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
