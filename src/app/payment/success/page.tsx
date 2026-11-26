"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiResponse, Payment } from "@/types/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id");

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment-verify", tranId],
    enabled: Boolean(tranId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${tranId}`);
      return res.data.data;
    },
  });

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">Payment Successful</CardTitle>
        <CardDescription>
          Your SSLCommerz tuition transaction has been verified and recorded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : payment ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono font-semibold">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={payment.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid At</span>
              <span>{formatDate(payment.paidAt)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Receipt className="mx-auto mb-2 h-5 w-5 text-slate-400" />
            {tranId ? `Transaction Reference: ${tranId}` : "Payment confirmed."}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/payments" className="flex-1">
            <Button className="w-full">View Payment History</Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Suspense fallback={<Skeleton className="h-80 w-full max-w-md rounded-xl" />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
