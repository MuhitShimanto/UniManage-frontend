import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPublicApi } from "@/lib/server-api";
import type { Department } from "@/types/api";

export const metadata: Metadata = {
  title: "About UniManage",
  description:
    "Learn about UniManage University's academic departments, governance, and digital campus infrastructure.",
};

const PILLARS = [
  {
    index: "01 / ACADEMICS",
    title: "Transparent Course Registration",
    description:
      "Real-time seat capacity tracking, automated prerequisite verification, and instant GPA computation.",
    spec: "18-Credit Semester Cap",
  },
  {
    index: "02 / GOVERNANCE",
    title: "Strict Role-Based Access",
    description:
      "Clean separation between Student, Instructor, and Registrar Admin workflows enforced at edge and API.",
    spec: "3 Fixed Primary Roles",
  },
  {
    index: "03 / SETTLEMENT",
    title: "Verified Tuition Checkout",
    description:
      "End-to-end SSLCommerz gateway integration for secure BDT tuition and registration fee settlement.",
    spec: "SSLCommerz Gateway",
  },
];

export default async function AboutPage() {
  const deptRes = await fetchPublicApi<Department[]>("/departments");
  const departments = deptRes?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Platform Architecture
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          About Our University & Digital Campus
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          UniManage connects students, faculty, and university registrars in a single,
          audit-logged academic platform—eliminating manual paperwork across course registration,
          prerequisite verification, attendance, grading, and tuition settlement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Card key={pillar.index}>
            <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  {pillar.index}
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-700">
                  {pillar.spec}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Faculties
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Academic Departments</h2>
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
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
                      DEPT / {dept.code}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-sm text-slate-600">
                    {dept.description || "Academic department offering accredited degree programs."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
