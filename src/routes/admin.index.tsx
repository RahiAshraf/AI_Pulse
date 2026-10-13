import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "./admin.dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexPage,
});

function AdminIndexPage() {
  return <AdminDashboardPage />;
}