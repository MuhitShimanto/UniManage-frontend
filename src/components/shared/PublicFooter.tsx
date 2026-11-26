import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span>UniManage</span>
            </Link>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              Unified University Management System for academic registration, faculty gradebooks,
              attendance tracking, official transcripts, and SSLCommerz tuition payments.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Academics</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/courses" className="hover:text-indigo-600">Course Catalog</Link></li>
              <li><Link href="/programs" className="hover:text-indigo-600">Degree Programs</Link></li>
              <li><Link href="/about" className="hover:text-indigo-600">About University</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-indigo-600">Sign In (Demo Login)</Link></li>
              <li><Link href="/register" className="hover:text-indigo-600">Student Registration</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-600">Admissions Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} UniManage University Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
