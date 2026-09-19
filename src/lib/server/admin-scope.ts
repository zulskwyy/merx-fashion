import { getAdminContext, isDemoAdmin, getDemoWorkspaceId } from "@/lib/server/admin-auth";

export function adminTable(table: string) {
  return isDemoAdmin() ? `demo_${table}` : table;
}

export function adminPath(table: string, query = "") {
  const base = adminTable(table);
  const workspaceId = getDemoWorkspaceId();
  if (!workspaceId) return query ? `${base}?${query}` : base;
  const scoped = `${query ? `${query}&` : ""}workspace_id=eq.${encodeURIComponent(workspaceId)}`;
  return `${base}?${scoped}`;
}

export function adminBody<T extends Record<string, any>>(row: T): T & Record<string, any> {
  const workspaceId = getDemoWorkspaceId();
  return workspaceId ? { ...row, workspace_id: workspaceId } : row;
}

export function requireAdminContext() {
  return getAdminContext();
}
