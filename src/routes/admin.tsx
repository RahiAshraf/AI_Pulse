import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminRootPage,
});

function AdminRootPage() {
  return <Outlet />;
}