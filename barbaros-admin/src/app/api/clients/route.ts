import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockClients } from "@/lib/mock-data";
import { requireRole } from "@/lib/authz";

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json({ data: mockClients });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const [{ data: clients, error: clientsError }, { data: appointments, error: appointmentsError }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("appointments").select("client_id,amount_paid"),
  ]);

  if (clientsError || appointmentsError) {
    return NextResponse.json({ error: clientsError?.message || appointmentsError?.message }, { status: 500 });
  }

  const totals = new Map<string, number>();
  (appointments ?? []).forEach((row) => {
    totals.set(row.client_id, (totals.get(row.client_id) ?? 0) + Number(row.amount_paid ?? 0));
  });

  const data = (clients ?? []).map((client) => ({
    ...client,
    total_spent: totals.get(client.id) ?? 0,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!hasSupabaseEnv()) return NextResponse.json({ data: { ...payload, id: `cli-${crypto.randomUUID()}`, total_spent: 0 } });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { ...data, total_spent: 0 } });
}
