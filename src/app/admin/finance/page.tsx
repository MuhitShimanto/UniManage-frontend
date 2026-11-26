"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { apiClient } from "@/lib/api-client";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, AuditLog, Semester, User } from "@/types/api";

const invoiceSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  semesterId: z.string().min(1, "Select a semester"),
  title: z.string().min(3, "Invoice title required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function AdminFinancePage() {
  const queryClient = useQueryClient();
  const [auditPage, setAuditPage] = useState(1);

  const { data: students = [] } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<User[]>>("/admin/users", {
          params: { role: "STUDENT", limit: 50 },
        })
      ).data.data,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: async () => (await apiClient.get<ApiResponse<Semester[]>>("/semesters")).data.data,
  });

  const { data: auditRes, isLoading: loadingAudit } = useQuery({
    queryKey: ["admin-audit-logs", auditPage],
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<AuditLog[]>>("/admin/audit-logs", {
          params: { page: auditPage, limit: 10 },
        })
      ).data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { amount: 25000 },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (vals: InvoiceFormValues) => {
      await apiClient.post("/payments/invoices", {
        ...vals,
        currency: "BDT",
        dueDate: new Date(vals.dueDate).toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Fee invoice generated for student!");
      reset({ amount: 25000 });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create invoice")),
  });

  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-600">{row.action}</span>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (row) => <span className="text-xs font-medium">{row.entityType}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.actor?.email ?? "System"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Timestamp",
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Finance & Audit Logs
        </h1>
        <p className="text-sm text-slate-500">
          Issue student tuition invoices and inspect immutable system audit logs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Fee Invoice</CardTitle>
            <CardDescription>Assign a payable tuition invoice to a student.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((vals) => createInvoiceMutation.mutate(vals))}
              className="space-y-3"
            >
              <div>
                <select
                  {...register("studentId")}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">Select Student...</option>
                  {students.map((s) =>
                    s.studentProfile ? (
                      <option key={s.id} value={s.studentProfile.id}>
                        {s.name} ({s.studentProfile.studentCode})
                      </option>
                    ) : null
                  )}
                </select>
                {errors.studentId && (
                  <p className="text-xs text-rose-600">{errors.studentId.message}</p>
                )}
              </div>
              <div>
                <select
                  {...register("semesterId")}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">Select Semester...</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name}
                    </option>
                  ))}
                </select>
                {errors.semesterId && (
                  <p className="text-xs text-rose-600">{errors.semesterId.message}</p>
                )}
              </div>
              <div>
                <Input placeholder="Title (e.g. Fall 2026 Tuition)" {...register("title")} />
                {errors.title && <p className="text-xs text-rose-600">{errors.title.message}</p>}
              </div>
              <div>
                <Input type="number" placeholder="Amount (BDT)" {...register("amount")} />
                {errors.amount && <p className="text-xs text-rose-600">{errors.amount.message}</p>}
              </div>
              <div>
                <Input type="date" {...register("dueDate")} />
                {errors.dueDate && (
                  <p className="text-xs text-rose-600">{errors.dueDate.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Receipt className="h-4 w-4" />
                {createInvoiceMutation.isPending ? "Generating..." : "Create Invoice"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>Immutable log of security and academic events.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={auditRes?.data ?? []}
                columns={auditColumns}
                keyExtractor={(r) => r.id}
                isLoading={loadingAudit}
                meta={auditRes?.meta}
                onPageChange={setAuditPage}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
