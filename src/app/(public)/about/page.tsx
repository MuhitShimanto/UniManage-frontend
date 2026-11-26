import type { Metadata } from "next";
import { Building2, CheckCircle2, Globe2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicApi } from "@/lib/server-api";
import type { Department } from "@/types/api";

export const metadata: Metadata = {
  title: "About UniManage",
  description:
    "Learn about UniManage University's academic departments, governance, and digital campus infrastructure.",
};

export default async function AboutPage() {
  const deptRes = await fetchPublicApi<Department[]>("/departments");
  const departments = deptRes?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          About Our University & Digital Campus
        </h1>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          UniManage connects students, faculty, and university registrars in a single,
          audit-logged academic platform—eliminating manual paperwork across course registration,
          prerequisite verification, attendance, grading, and tuition settlement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Globe2 className="mb-2 h-6 w-6 text-indigo-600" />
            <CardTitle>Transparent Academics</CardTitle>
            <CardDescription>
              Real-time seat availability, prerequisite enforcement, and instant GPA computation.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <ShieldCheck className="mb-2 h-6 w-6 text-emerald-600" />
            <CardTitle>Role-Based Governance</CardTitle>
            <CardDescription>
              Strict separation between Student, Instructor, and Registrar Admin workflows.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CheckCircle2 className="mb-2 h-6 w-6 text-sky-600" />
            <CardTitle>Verified Payments</CardTitle>
            <CardDescription>
              End-to-end SSLCommerz gateway integration for secure tuition & registration fees.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Academic Departments
          </h2>
          <p className="text-sm text-slate-500">
            Active faculties offering undergraduate and graduate programs
          </p>
        </div>

        {departments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">
              Department directory will populate once connected to the API server.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{dept.code}</span>
                  </div>
                  <CardTitle className="mt-1">{dept.name}</CardTitle>
                  <CardDescription>
                    {dept.description || "Academic department offering accredited degree programs."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
