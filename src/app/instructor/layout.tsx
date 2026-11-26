import { DashboardShell } from "@/components/shared/DashboardShell";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="INSTRUCTOR">{children}</DashboardShell>;
}
