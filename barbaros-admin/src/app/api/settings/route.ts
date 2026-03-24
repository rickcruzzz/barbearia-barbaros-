import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireRole } from "@/lib/authz";

const fallbackData = {
  id: "local",
  name: "Bárbaros Barbershop",
  address: "Stella Maris, Salvador/BA",
  phone: "(71) 98354-2132",
  whatsapp: "5571983542132",
  instagram: "@barbaros",
  interval: 30,
};

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json({ data: fallbackData });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase.from("barbershop").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data) return NextResponse.json({ data: fallbackData });

  const interval = Number((data.working_hours_json as any)?.slot_interval_minutes ?? 30);
  return NextResponse.json({
    data: {
      ...data,
      interval,
    },
  });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, data: { ...fallbackData, ...payload } });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin"]);
  if ("response" in permission) return permission.response;
  const { data: current, error: readError } = await supabase.from("barbershop").select("id,working_hours_json").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 });

  const updates = {
    name: payload.name,
    address: payload.address,
    phone: payload.phone,
    whatsapp: payload.whatsapp,
    instagram: payload.instagram || null,
    working_hours_json: {
      ...((current?.working_hours_json as Record<string, unknown>) ?? {}),
      slot_interval_minutes: Number(payload.interval ?? 30),
    },
  };

  if (!current?.id) {
    const { data, error } = await supabase.from("barbershop").insert(updates).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  }

  const { data, error } = await supabase.from("barbershop").update(updates).eq("id", current.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}
