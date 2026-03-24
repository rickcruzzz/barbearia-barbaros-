import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockBarbers } from "@/lib/mock-data";
import { requireRole } from "@/lib/authz";

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json({ data: mockBarbers.map((barber) => ({ ...barber, role: "barbeiro" })) });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase.from("barbers").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      data: { ...payload, id: `bar-${crypto.randomUUID()}`, role: "barbeiro", photo_url: payload.photo_url || null, is_active: true },
    });
  }

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase
    .from("barbers")
    .insert({
      name: payload.name,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "barbeiro",
      photo_url: typeof payload.photo_url === "string" ? payload.photo_url : null,
      commission_pct: Number(payload.commission_pct ?? 40),
      is_active: true,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (!payload.id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin"]);
  if ("response" in permission) return permission.response;
  const updates: Record<string, unknown> = {};
  if (typeof payload.name === "string") updates.name = payload.name;
  if (typeof payload.email === "string") updates.email = payload.email;
  if (payload.role === "admin" || payload.role === "barbeiro") updates.role = payload.role;
  if ("photo_url" in payload) updates.photo_url = typeof payload.photo_url === "string" ? payload.photo_url : null;
  if ("commission_pct" in payload) updates.commission_pct = Number(payload.commission_pct ?? 40);
  if ("is_active" in payload) updates.is_active = Boolean(payload.is_active);

  const { error } = await supabase.from("barbers").update(updates).eq("id", payload.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
