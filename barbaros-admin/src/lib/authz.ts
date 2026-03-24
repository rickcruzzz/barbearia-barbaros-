import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "admin" | "barbeiro";

export async function getCurrentUserRole(supabase: SupabaseClient): Promise<UserRole | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (error || !data?.role) return null;
  if (data.role !== "admin" && data.role !== "barbeiro") return null;
  return data.role;
}

export async function requireRole(
  supabase: SupabaseClient,
  allowedRoles: UserRole[]
): Promise<{ role: UserRole } | { response: NextResponse }> {
  const role = await getCurrentUserRole(supabase);
  if (!role) {
    return { response: NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 }) };
  }
  if (!allowedRoles.includes(role)) {
    return { response: NextResponse.json({ error: "Sem permissão para esta operação." }, { status: 403 }) };
  }
  return { role };
}
