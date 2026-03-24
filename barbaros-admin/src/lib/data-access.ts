import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockAppointments, mockBarbers, mockClients, mockServices } from "@/lib/mock-data";
import { AdminAppointment, AdminBarber, AdminClient, AdminService, DashboardMetrics } from "@/lib/types";

function mapAppointmentRow(row: any): AdminAppointment {
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

function mapMockAppointment(row: (typeof mockAppointments)[number]): AdminAppointment {
  const [date] = row.starts_at.split("T");
  const start_time = row.starts_at.slice(11, 19);
  const end_time = row.ends_at.slice(11, 19);
  return {
    id: row.id,
    client_id: row.id,
    barber_id: row.id,
    service_id: row.id,
    client_name: row.client_name,
    barber_name: row.barber_name,
    service_name: row.service_name,
    date,
    start_time,
    end_time,
    status: row.status,
    payment_method: null,
    amount_paid: Number(row.amount_paid ?? 0),
    notes: null,
    created_at: row.starts_at,
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!hasSupabaseEnv()) {
    return {
      appointmentsToday: mockAppointments.length,
      revenueToday: mockAppointments.reduce((acc, item) => acc + item.amount_paid, 0),
      newClients: mockClients.length,
      pendingAppointments: mockAppointments.filter((item) => item.status === "pending").length,
    };
  }

  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [{ count: appointmentsCount }, { data: revenueRows }, { count: newClients }, { count: pendingAppointments }] = await Promise.all([
    supabase.from("appointments").select("*", { head: true, count: "exact" }).gte("date", today).lt("date", tomorrow),
    supabase.from("appointments").select("amount_paid").gte("date", today).lt("date", tomorrow).not("amount_paid", "is", null),
    supabase.from("clients").select("*", { head: true, count: "exact" }).gte("created_at", `${today}T00:00:00.000Z`).lt("created_at", `${tomorrow}T00:00:00.000Z`),
    supabase.from("appointments").select("*", { head: true, count: "exact" }).eq("status", "pending"),
  ]);

  const revenueToday = (revenueRows ?? []).reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);

  return {
    appointmentsToday: appointmentsCount ?? 0,
    revenueToday,
    newClients: newClients ?? 0,
    pendingAppointments: pendingAppointments ?? 0,
  };
}

export async function getAppointments(limit = 120) {
  if (!hasSupabaseEnv()) return mockAppointments.map(mapMockAppointment);
  const supabase = createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id,client_id,barber_id,service_id,date,start_time,end_time,status,amount_paid,clients(name),barbers(name),services(name)")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 500));
  return (data ?? []).map(mapAppointmentRow);
}

export async function getAppointmentsByClient(clientId: string): Promise<AdminAppointment[]> {
  if (!hasSupabaseEnv()) {
    return mockAppointments.map(mapMockAppointment).filter((appointment) => appointment.client_id === clientId);
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id,client_id,barber_id,service_id,date,start_time,end_time,status,amount_paid,payment_method,notes,created_at,clients(name),barbers(name),services(name)")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  return (data ?? []).map(mapAppointmentRow);
}

export async function getServices(): Promise<AdminService[]> {
  if (!hasSupabaseEnv()) return mockServices as AdminService[];
  const supabase = createClient();
  const { data } = await supabase.from("services").select("*").order("name");
  return (data ?? []) as AdminService[];
}

export async function getBarbers(): Promise<AdminBarber[]> {
  if (!hasSupabaseEnv()) {
    return mockBarbers.map((barber) => ({ ...barber, role: "barbeiro" as const }));
  }
  const supabase = createClient();
  const { data } = await supabase.from("barbers").select("*").order("name");
  return (data ?? []) as AdminBarber[];
}

export async function getClients(): Promise<AdminClient[]> {
  if (!hasSupabaseEnv()) return mockClients as AdminClient[];
  const supabase = createClient();
  const [{ data: clients }, { data: appointments }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("appointments").select("client_id,amount_paid"),
  ]);

  const totals = new Map<string, number>();
  (appointments ?? []).forEach((row) => {
    totals.set(row.client_id, (totals.get(row.client_id) ?? 0) + Number(row.amount_paid ?? 0));
  });

  return (clients ?? []).map((client) => ({
    ...client,
    total_spent: totals.get(client.id) ?? 0,
  })) as AdminClient[];
}
