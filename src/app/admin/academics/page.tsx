"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, Course, Department, Program, Section, Semester, User } from "@/types/api";

type AcademicTab = "courses" | "departments" | "programs" | "semesters" | "sections";

const courseWizardSchema = z.object({
  code: z.string().min(2, "Course code required").max(20),
  title: z.string().min(3, "Course title required").max(120),
  credits: z.coerce.number().int().min(1).max(6),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  programId: z.string().optional(),
  prerequisiteIds: z.array(z.string()),
});

type CourseWizardValues = z.infer<typeof courseWizardSchema>;

export default function AdminAcademicsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AcademicTab>("courses");
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Simple creation states for dept, program, semester, section
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progName, setProgName] = useState("");
  const [progDeptId, setProgDeptId] = useState("");
  const [semName, setSemName] = useState("");
  const [semYear, setSemYear] = useState(2026);
  const [semTerm, setSemTerm] = useState("Spring");
  const [secCourseId, setSecCourseId] = useState("");
  const [secSemId, setSecSemId] = useState("");
  const [secInstId, setSecInstId] = useState("");
  const [secCode, setSecCode] = useState("B");
  const [secSlot, setSecSlot] = useState("SUN-TUE 14:00-15:30");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSecInstId, setEditSecInstId] = useState("");
  const [editSecCode, setEditSecCode] = useState("");
  const [editSecCap, setEditSecCap] = useState(40);
  const [editSecSlot, setEditSecSlot] = useState("");
  const [editSecRoom, setEditSecRoom] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await apiClient.get<ApiResponse<Department[]>>("/departments")).data.data,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await apiClient.get<ApiResponse<Program[]>>("/programs")).data.data,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () =>
      (await apiClient.get<ApiResponse<Course[]>>("/courses", { params: { limit: 50 } })).data.data,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => (await apiClient.get<ApiResponse<Semester[]>>("/semesters")).data.data,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => (await apiClient.get<ApiResponse<Section[]>>("/sections")).data.data,
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<User[]>>("/admin/users", {
          params: { role: "INSTRUCTOR", limit: 50 },
        })
      ).data.data,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CourseWizardValues>({
    resolver: zodResolver(courseWizardSchema),
    defaultValues: { credits: 3, prerequisiteIds: [] },
  });

  const selectedPrereqs = watch("prerequisiteIds") ?? [];

  const createCourseMutation = useMutation({
    mutationFn: async (vals: CourseWizardValues) => {
      await apiClient.post("/courses", {
        ...vals,
        programId: vals.programId || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Course created successfully!");
      reset({ credits: 3, prerequisiteIds: [] });
      setWizardStep(1);
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create course")),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/courses/${id}`),
    onSuccess: () => {
      toast.success("Course deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete course")),
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

  const createSectionMutation = useMutation({
    mutationFn: async () =>
      apiClient.post("/sections", {
        courseId: secCourseId,
        semesterId: secSemId,
        instructorId: secInstId,
        sectionCode: secCode,
        maxCapacity: 40,
        scheduleSlot: secSlot,
        room: "AB-202",
      }),
    onSuccess: () => {
      toast.success("Section created");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create section")),
  });

  const updateSectionMutation = useMutation({
    mutationFn: async (sectionId: string) =>
      apiClient.patch(`/sections/${sectionId}`, {
        instructorId: editSecInstId,
        sectionCode: editSecCode,
        maxCapacity: Number(editSecCap),
        scheduleSlot: editSecSlot,
        room: editSecRoom || null,
      }),
    onSuccess: () => {
      toast.success("Section updated");
      setEditingSectionId(null);
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update section")),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => apiClient.delete(`/sections/${sectionId}`),
    onSuccess: () => {
      toast.success("Section deleted");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete section")),
  });

  async function nextWizardStep() {
    if (wizardStep === 1) {
      const ok = await trigger(["code", "title", "credits"]);
      if (ok) setWizardStep(2);
    } else if (wizardStep === 2) {
      const ok = await trigger(["departmentId"]);
      if (ok) setWizardStep(3);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Academic Structure & Curriculum
        </h1>
        <p className="text-sm text-slate-500">
          Manage departments, programs, courses (with multi-step prerequisite wizard), semesters, and sections.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {(["courses", "departments", "programs", "semesters", "sections"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium capitalize cursor-pointer ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "courses" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 3-Step Course Wizard */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Create Course Wizard</CardTitle>
              <CardDescription>Step {wizardStep} of 3</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit((vals) => {
                  if (wizardStep !== 3) return;
                  createCourseMutation.mutate(vals);
                })}
                className="space-y-4"
              >
                {wizardStep === 1 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Course Code</label>
                      <Input placeholder="CSE301" {...register("code")} />
                      {errors.code && <p className="text-xs text-rose-600">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Course Title</label>
                      <Input placeholder="Database Systems" {...register("title")} />
                      {errors.title && <p className="text-xs text-rose-600">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Credits</label>
                      <Input type="number" min={1} max={6} {...register("credits")} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Description</label>
                      <Input placeholder="Relational algebra, SQL..." {...register("description")} />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Department</label>
                      <select
                        {...register("departmentId")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} — {d.name}
                          </option>
                        ))}
                      </select>
                      {errors.departmentId && (
                        <p className="text-xs text-rose-600">{errors.departmentId.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Program (Optional)</label>
                      <select
                        {...register("programId")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="">Any Program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-600">
                      Select Prerequisite Courses (Optional)
                    </p>
                    <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
                      {courses.map((c) => {
                        const checked = selectedPrereqs.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...selectedPrereqs, c.id]
                                  : selectedPrereqs.filter((id) => id !== c.id);
                                setValue("prerequisiteIds", next);
                              }}
                            />
                            <span>
                              {c.code} — {c.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  {wizardStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWizardStep((s) => (s === 3 ? 2 : 1))}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}

                  {wizardStep < 3 ? (
                    <Button key="wizard-next" type="button" size="sm" onClick={nextWizardStep}>
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      key="wizard-submit"
                      type="submit"
                      size="sm"
                      disabled={createCourseMutation.isPending}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All Courses ({courses.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold">
                      {c.code} — {c.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.credits} Credits • {c.department?.code}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600"
                    onClick={() => deleteCourseMutation.mutate(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "departments" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Department</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Code (e.g. EEE)" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
              <Input placeholder="Department Name" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              <Button disabled={!deptCode || !deptName || createDeptMutation.isPending} onClick={() => createDeptMutation.mutate()}>
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Departments ({departments.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {departments.map((d) => (
                <div key={d.id} className="py-2.5 text-sm">
                  <span className="font-semibold text-indigo-600">{d.code}</span> — {d.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "programs" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Degree Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Code (e.g. BSC-EEE)" value={progCode} onChange={(e) => setProgCode(e.target.value)} />
              <Input placeholder="Program Name" value={progName} onChange={(e) => setProgName(e.target.value)} />
              <select
                value={progDeptId}
                onChange={(e) => setProgDeptId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
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
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {programs.map((p) => (
                <div key={p.id} className="py-2.5 text-sm">
                  <span className="font-semibold text-emerald-600">{p.code}</span> — {p.name} (
                  {p.totalCreditsRequired} Cr)
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "semesters" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Semester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Name (e.g. Spring 2027)" value={semName} onChange={(e) => setSemName(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={semYear} onChange={(e) => setSemYear(Number(e.target.value))} />
                <Input placeholder="Term (Spring/Fall)" value={semTerm} onChange={(e) => setSemTerm(e.target.value)} />
              </div>
              <Button disabled={!semName || createSemesterMutation.isPending} onClick={() => createSemesterMutation.mutate()}>
                <Plus className="h-4 w-4" />
                Create Semester
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Semesters ({semesters.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
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
      )}

      {tab === "sections" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Open New Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                value={secCourseId}
                onChange={(e) => setSecCourseId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
              <select
                value={secSemId}
                onChange={(e) => setSecSemId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select Semester...</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={secInstId}
                onChange={(e) => setSecInstId(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select Instructor...</option>
                {instructors.map((u) =>
                  u.instructorProfile ? (
                    <option key={u.id} value={u.instructorProfile.id}>
                      {u.name} ({u.instructorProfile.employeeCode})
                    </option>
                  ) : null
                )}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Section Code (A, B)" value={secCode} onChange={(e) => setSecCode(e.target.value)} />
                <Input placeholder="Schedule Slot" value={secSlot} onChange={(e) => setSecSlot(e.target.value)} />
              </div>
              <Button
                disabled={!secCourseId || !secSemId || !secInstId || createSectionMutation.isPending}
                onClick={() => createSectionMutation.mutate()}
              >
                <Plus className="h-4 w-4" />
                Create Section
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Sections ({sections.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {sections.map((s) => {
                const isEditing = editingSectionId === s.id;
                return (
                  <div key={s.id} className="py-3 text-sm">
                    {isEditing ? (
                      <div className="space-y-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
                        <p className="text-xs font-semibold text-indigo-700">
                          Editing {s.course.code} — {s.semester.name}
                        </p>
                        <select
                          value={editSecInstId}
                          onChange={(e) => setEditSecInstId(e.target.value)}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                        >
                          {instructors.map((u) =>
                            u.instructorProfile ? (
                              <option key={u.id} value={u.instructorProfile.id}>
                                {u.name} ({u.instructorProfile.employeeCode})
                              </option>
                            ) : null
                          )}
                        </select>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Sec"
                            value={editSecCode}
                            onChange={(e) => setEditSecCode(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            type="number"
                            min={5}
                            max={300}
                            placeholder="Capacity"
                            value={editSecCap}
                            onChange={(e) => setEditSecCap(Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Room"
                            value={editSecRoom}
                            onChange={(e) => setEditSecRoom(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <Input
                          placeholder="Schedule Slot"
                          value={editSecSlot}
                          onChange={(e) => setEditSecSlot(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={updateSectionMutation.isPending}
                            onClick={() => updateSectionMutation.mutate(s.id)}
                          >
                            <Save className="h-3.5 w-3.5" />
                            {updateSectionMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSectionId(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {s.course.code} (Sec {s.sectionCode}) — {s.semester.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.instructor.user.name} • {s.scheduleSlot} •{" "}
                            {s.room ? `Room ${s.room} • ` : ""}
                            {s.enrolledCount}/{s.maxCapacity} seats
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSectionId(s.id);
                              setEditSecInstId(s.instructorId);
                              setEditSecCode(s.sectionCode);
                              setEditSecCap(s.maxCapacity);
                              setEditSecSlot(s.scheduleSlot);
                              setEditSecRoom(s.room ?? "");
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600"
                            disabled={deleteSectionMutation.isPending}
                            onClick={() => deleteSectionMutation.mutate(s.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
