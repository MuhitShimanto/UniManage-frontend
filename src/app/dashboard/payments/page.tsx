"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import type { ApiResponse, FeeInvoice, Payment, PaymentInitiateResponse } from "@/types/api";

export default function StudentPaymentsPage() {
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<FeeInvoice[]>>("/payments/invoices/my");
      return res.data.data;
    },
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Payment[]>>("/payments/my");
      return res.data.data;
    },
  });

  const payMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await apiClient.post<ApiResponse<PaymentInitiateResponse>>("/payments/initiate", {
        invoiceId,
        provider: "SSLCOMMERZ",
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success("Redirecting to SSLCommerz payment gateway...");
      window.location.href = data.gatewayUrl;
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Unable to initiate payment session"));
    },
  });

  const invoiceColumns: ColumnDef<FeeInvoice>[] = [
    {
      key: "title",
      header: "Invoice",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-500">{row.semester?.name ?? "Semester Fee"}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.amount, row.currency)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.dueDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "action",
      header: "",
      render: (row) =>
        row.status === "PENDING" ? (
          <Button
            size="sm"
            disabled={payMutation.isPending}
            onClick={() => payMutation.mutate(row.id)}
          >
            <CreditCard className="h-4 w-4" />
            Pay via SSLCommerz
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400">Paid {formatDate(row.paidAt)}</span>
        ),
    },
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      key: "tranId",
      header: "Transaction ID",
      render: (row) => <span className="font-mono text-xs font-semibold">{row.transactionId}</span>,
    },
    {
      key: "provider",
      header: "Gateway",
      render: (row) => <span className="text-xs font-medium">{row.provider}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatCurrency(row.amount, row.currency),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tuition Invoices & Payments
        </h1>
        <p className="text-sm text-slate-500">
          Settle pending university fee invoices securely using SSLCommerz Sandbox.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Invoices</CardTitle>
          <CardDescription>Click Pay via SSLCommerz to complete checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={invoiceColumns}
            keyExtractor={(r) => r.id}
            isLoading={loadingInvoices}
            emptyTitle="No fee invoices"
            emptyDescription="You have no fee invoices assigned yet."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All initiated and completed gateway transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={payments}
            columns={paymentColumns}
            keyExtractor={(r) => r.id}
            isLoading={loadingPayments}
            emptyTitle="No payment history"
            emptyDescription="Your SSLCommerz payment transactions will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
