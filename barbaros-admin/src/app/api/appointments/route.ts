import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockAppointments } from "@/lib/mock-data";
import { AppointmentStatus } from "@/lib/types";
import { requireRole } from "@/lib/authz";

const VALID_STATUS: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

function mapAppointmentRow(row: any) {
  return {
    id: row.id,
    client_id: row.client_id,
    barber_id: row.barber_id,
    service_id: row.service_id,
    client_name: row.clients?.name ?? "Cliente",
    barber_name: row.barbers?.name ?? "Barbeiro",
    service_name: row.services?.name ?? "Serviço",
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    payment_method: row.payment_method ?? null,
    amount_paid: Number(row.amount_paid ?? 0),
    notes: row.notes ?? null,
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const barberId = searchParams.get("barber_id");
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const query = searchParams.get("q");
  const appointmentId = searchParams.get("appointment_id");
  const limitValue = Number(searchParams.get("limit") ?? "200");
  const safeLimit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 500) : 200;

  if (!hasSupabaseEnv()) {
    let data = mockAppointments.map((item) => ({
        id: item.id,
        client_id: item.id,
        barber_id: item.id,
        service_id: item.id,
        client_name: item.client_name,
        barber_name: item.barber_name,
        service_name: item.service_name,
        date: item.starts_at.slice(0, 10),
        start_time: item.starts_at.slice(11, 19),
        end_time: item.ends_at.slice(11, 19),
        status: item.status,
        payment_method: null,
        amount_paid: Number(item.amount_paid ?? 0),
        notes: null,
        created_at: item.starts_at,
      }));

    if (status && status !== "all") data = data.filter((item) => item.status === status);
    if (query) {
      const term = query.toLowerCase();
      data = data.filter((item) => item.client_name.toLowerCase().includes(term) || item.service_name.toLowerCase().includes(term));
    }

    return NextResponse.json({ data });
  }

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  let requestQuery = supabase
    .from("appointments")
    .select("id,client_id,barber_id,service_id,date,start_time,end_time,status,payment_method,amount_paid,notes,created_at,clients(name),barbers(name),services(name)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(safeLimit);

  if (status && status !== "all" && VALID_STATUS.includes(status as AppointmentStatus)) {
    requestQuery = requestQuery.eq("status", status);
  }
  if (barberId && barberId !== "all") {
    requestQuery = requestQuery.eq("barber_id", barberId);
  }
  if (fromDate) {
    requestQuery = requestQuery.gte("date", fromDate);
  }
  if (toDate) {
    requestQuery = requestQuery.lte("date", toDate);
  }

  const { data, error } = await requestQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let mapped = (data ?? []).map(mapAppointmentRow);
  if (query) {
    const term = query.toLowerCase();
    mapped = mapped.filter((item) => item.client_name.toLowerCase().includes(term) || item.service_name.toLowerCase().includes(term));
  }

  let auditLogs: any[] = [];
  const includeAudit = searchParams.get("include_audit") === "true";
  if (includeAudit) {
    let logsQuery = supabase
      .from("appointment_audit_logs")
      .select("id,appointment_id,action,old_status,new_status,actor_user_id,actor_email,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(120);
    if (appointmentId) {
      logsQuery = logsQuery.eq("appointment_id", appointmentId);
    }
    const { data: logsData } = await logsQuery;
    auditLogs = logsData ?? [];
  }

  return NextResponse.json({
    data: mapped,
    audit_logs: auditLogs,
  });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  if (!payload.id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true });

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin", "barbeiro"]);
  if ("response" in permission) return permission.response;
  const role = permission.role;
  if (role === "barbeiro" && ("date" in payload || "start_time" in payload || "end_time" in payload)) {
    return NextResponse.json({ error: "Somente admin pode editar data e horário." }, { status: 403 });
  }
  if (role === "barbeiro" && ("payment_method" in payload || "amount_paid" in payload)) {
    return NextResponse.json({ error: "Somente admin pode editar pagamento." }, { status: 403 });
  }
  const { data: beforeRow, error: beforeError } = await supabase
    .from("appointments")
    .select("id,barber_id,status,date,start_time,end_time")
    .eq("id", payload.id)
    .single();
  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 400 });

  if ((payload.date || payload.start_time || payload.end_time) && (!payload.date || !payload.start_time || !payload.end_time)) {
    return NextResponse.json({ error: "Para editar horário, envie date, start_time e end_time juntos." }, { status: 400 });
  }

  if (payload.date && payload.start_time && payload.end_time) {
    const { data: conflictRows, error: conflictError } = await supabase
      .from("appointments")
      .select("id")
      .eq("barber_id", payload.barber_id ?? beforeRow?.barber_id)
      .eq("date", payload.date)
      .neq("id", payload.id)
      .neq("status", "cancelled")
      .lt("start_time", payload.end_time)
      .gt("end_time", payload.start_time)
      .limit(1);
    if (conflictError) return NextResponse.json({ error: conflictError.message }, { status: 400 });
    if ((conflictRows ?? []).length > 0) {
      return NextResponse.json({ error: "Conflito de horário com outro agendamento." }, { status: 409 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (payload.status) updates.status = payload.status;
  if ("payment_method" in payload && role === "admin") updates.payment_method = payload.payment_method;
  if ("amount_paid" in payload && role === "admin") updates.amount_paid = Number(payload.amount_paid ?? 0);
  if ("notes" in payload) updates.notes = payload.notes;
  if ("date" in payload && role === "admin") updates.date = payload.date;
  if ("start_time" in payload && role === "admin") updates.start_time = payload.start_time;
  if ("end_time" in payload && role === "admin") updates.end_time = payload.end_time;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo permitido para atualização." }, { status: 400 });
  }

  const { error } = await supabase.from("appointments").update(updates).eq("id", payload.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("appointment_audit_logs").insert({
    appointment_id: payload.id,
    action: payload.action || "appointment_updated",
    old_status: beforeRow?.status ?? null,
    new_status: payload.status ?? beforeRow?.status ?? null,
    actor_user_id: user?.id ?? null,
    actor_email: user?.email ?? null,
    metadata: {
      fields: Object.keys(updates),
      date: payload.date ?? beforeRow?.date ?? null,
      start_time: payload.start_time ?? beforeRow?.start_time ?? null,
      end_time: payload.end_time ?? beforeRow?.end_time ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
