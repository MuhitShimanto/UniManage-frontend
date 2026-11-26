"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Semester } from "@/types/api";

export default function AdminSemestersPage() {
  const queryClient = useQueryClient();
  const [semName, setSemName] = useState("");
  const [semYear, setSemYear] = useState(2026);
  const [semTerm, setSemTerm] = useState("Spring");

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => (await apiClient.get<ApiResponse<Semester[]>>("/semesters")).data.data,
  });

  const createSemesterMutation = useMutation({
    mutationFn: async () =>
      apiClient.post("/semesters", {
        name: semName,
        year: semYear,
        term: semTerm,
        startDate: new Date(`${semYear}-01-15T00:00:00Z`).toISOString(),
        endDate: new Date(`${semYear}-05-15T00:00:00Z`).toISOString(),
        isCurrent: false,
        registrationOpen: true,
      }),
    onSuccess: () => {
      toast.success("Semester created");
      setSemName("");
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create semester")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Semesters</h1>
        <p className="text-sm text-slate-500">
          Create and manage academic terms and registration windows.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Semester</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Name (e.g. Spring 2027)"
              value={semName}
              onChange={(e) => setSemName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={semYear}
                onChange={(e) => setSemYear(Number(e.target.value))}
              />
              <select
                value={semTerm}
                onChange={(e) => setSemTerm(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
              </select>
            </div>
            <Button
              disabled={!semName || createSemesterMutation.isPending}
              onClick={() => createSemesterMutation.mutate()}
            >
              <Plus className="h-4 w-4" />
              Create Semester
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semesters ({semesters.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {semesters.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </p>
                </div>
                {s.isCurrent && <StatusBadge status="ACTIVE" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
