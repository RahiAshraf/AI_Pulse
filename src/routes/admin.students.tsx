import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "./admin.dashboard";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
  return <AdminDashboardPage initialSection="students" />;
}