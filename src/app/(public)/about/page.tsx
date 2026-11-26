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
    label: "Academics",
    title: "Transparent Course Registration",
    description:
      "Real-time seat capacity tracking, automated prerequisite verification, and instant GPA computation.",
  },
  {
    label: "Governance",
    title: "Role-Based Access Control",
    description:
      "Strict separation between Student, Instructor, and Registrar Admin workflows enforced at edge and API.",
  },
  {
    label: "Payments",
    title: "Verified Tuition Settlement",
    description:
      "End-to-end SSLCommerz gateway integration for secure BDT tuition and registration fee settlement.",
  },
];

export default async function AboutPage() {
  const deptRes = await fetchPublicApi<Department[]>("/departments");
  const departments = deptRes?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
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
          <Card key={pillar.label} interactive className="border-t-2 border-t-indigo-600">
            <CardContent className="space-y-2.5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {pillar.label}
              </p>
              <h2 className="text-lg font-bold text-slate-900">{pillar.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{pillar.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Academic Departments</h2>
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
              <Card key={dept.id} interactive className="border-l-2 border-l-indigo-600">
                <CardContent className="space-y-2 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    {dept.code}
                  </p>
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
