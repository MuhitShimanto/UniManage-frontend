import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">404</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline">Browse Courses</Button>
        </Link>
      </div>
    </div>
  );
}
