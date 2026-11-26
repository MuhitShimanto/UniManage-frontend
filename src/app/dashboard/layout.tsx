import { DashboardShell } from "@/components/shared/DashboardShell";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="STUDENT">{children}</DashboardShell>;
}
