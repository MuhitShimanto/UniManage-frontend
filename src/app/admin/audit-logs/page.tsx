"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { ApiResponse, AuditLog } from "@/types/api";

export default function AdminAuditLogsPage() {
  const [auditPage, setAuditPage] = useState(1);

  const { data: auditRes, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", auditPage],
    queryFn: async () =>
      (
        await apiClient.get<ApiResponse<AuditLog[]>>("/admin/audit-logs", {
          params: { page: auditPage, limit: 15 },
        })
      ).data,
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
        <span className="text-xs text-slate-600">{row.actor?.email ?? "System"}</span>
      ),
    },
    {
      key: "date",
      header: "Timestamp",
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500">
          Immutable log of security, academic, and administrative events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Trail</CardTitle>
          <CardDescription>All recorded mutations with date and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={auditRes?.data ?? []}
            columns={auditColumns}
            keyExtractor={(r) => r.id}
            isLoading={isLoading}
            meta={auditRes?.meta}
            onPageChange={setAuditPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
