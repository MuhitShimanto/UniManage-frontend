"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id");
  const status = searchParams.get("status") ?? "cancelled";

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <XCircle className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">
          {status === "failed" ? "Payment Failed" : "Payment Cancelled"}
        </CardTitle>
        <CardDescription>
          Your tuition payment was not completed. No charges were applied to your invoice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tranId && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Reference ID: <span className="font-mono font-semibold">{tranId}</span>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/dashboard/payments" className="flex-1">
            <Button className="w-full">Retry Payment</Button>
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

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Suspense fallback={<Skeleton className="h-72 w-full max-w-md rounded-xl" />}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
