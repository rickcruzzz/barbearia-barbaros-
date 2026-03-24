import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockServices } from "@/lib/mock-data";
import { requireRole } from "@/lib/authz";

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json({ data: mockServices });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase.from("services").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!hasSupabaseEnv()) return NextResponse.json({ data: { ...payload, id: `svc-${crypto.randomUUID()}` } });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: payload.name,
      description: payload.description || null,
      price: Number(payload.price ?? 0),
      duration_minutes: Number(payload.duration_minutes ?? 30),
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
  if ("description" in payload) updates.description = payload.description || null;
  if ("price" in payload) updates.price = Number(payload.price ?? 0);
  if ("duration_minutes" in payload) updates.duration_minutes = Number(payload.duration_minutes ?? 30);
  if ("is_active" in payload) updates.is_active = Boolean(payload.is_active);

  const { error } = await supabase.from("services").update(updates).eq("id", payload.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
