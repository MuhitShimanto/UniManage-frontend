"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Department, Program } from "@/types/api";

export default function AdminDepartmentsAndProgramsPage() {
  const queryClient = useQueryClient();

  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progName, setProgName] = useState("");
  const [progDeptId, setProgDeptId] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await apiClient.get<ApiResponse<Department[]>>("/departments")).data.data,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await apiClient.get<ApiResponse<Program[]>>("/programs")).data.data,
  });

  const createDeptMutation = useMutation({
    mutationFn: async () => apiClient.post("/departments", { code: deptCode, name: deptName }),
    onSuccess: () => {
      toast.success("Department created");
      setDeptCode("");
      setDeptName("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create department")),
  });

  const createProgramMutation = useMutation({
    mutationFn: async () =>
      apiClient.post("/programs", {
        code: progCode,
        name: progName,
        departmentId: progDeptId,
        totalCreditsRequired: 130,
      }),
    onSuccess: () => {
      toast.success("Program created");
      setProgCode("");
      setProgName("");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create program")),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Departments & Programs
        </h1>
        <p className="text-sm text-slate-500">
          Manage academic faculties and accredited degree programs.
        </p>
      </div>

      {/* Departments */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Departments</h2>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <Card className="md:sticky md:top-24">
            <CardHeader>
              <CardTitle>Add Department</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Code (e.g. EEE)"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
              />
              <Input
                placeholder="Department Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
              <Button
                disabled={!deptCode || !deptName || createDeptMutation.isPending}
                onClick={() => createDeptMutation.mutate()}
              >
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Departments ({departments.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {departments.map((d) => (
                <div key={d.id} className="py-2.5 text-sm">
                  <span className="font-semibold text-indigo-600">{d.code}</span> — {d.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Programs */}
      <section className="space-y-4 border-t border-slate-200/80 pt-6">
        <h2 className="text-lg font-bold text-slate-900">Degree Programs</h2>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <Card className="md:sticky md:top-24">
            <CardHeader>
              <CardTitle>Add Degree Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Code (e.g. BSC-EEE)"
                value={progCode}
                onChange={(e) => setProgCode(e.target.value)}
              />
              <Input
                placeholder="Program Name"
                value={progName}
                onChange={(e) => setProgName(e.target.value)}
              />
              <select
                value={progDeptId}
                onChange={(e) => setProgDeptId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
              <Button
                disabled={!progCode || !progName || !progDeptId || createProgramMutation.isPending}
                onClick={() => createProgramMutation.mutate()}
              >
                <Plus className="h-4 w-4" />
                Create Program
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programs ({programs.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {programs.map((p) => (
                <div key={p.id} className="py-2.5 text-sm">
                  <span className="font-semibold text-emerald-600">{p.code}</span> — {p.name} (
                  {p.totalCreditsRequired} Cr)
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
