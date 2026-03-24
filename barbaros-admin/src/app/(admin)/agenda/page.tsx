"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AdminAppointment, AdminBarber, AppointmentAuditLog, AppointmentStatus } from "@/lib/types";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [auditLogs, setAuditLogs] = useState<AppointmentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [barberFilter, setBarberFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [detailStatus, setDetailStatus] = useState<AppointmentStatus>("pending");
  const [detailDate, setDetailDate] = useState("");
  const [detailStart, setDetailStart] = useState("");
  const [detailEnd, setDetailEnd] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const auditLogsCache = useRef<Record<string, AppointmentAuditLog[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (barberFilter !== "all") params.set("barber_id", barberFilter);
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("limit", "220");

      const response = await fetch(`/api/appointments?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao carregar agenda.");

      const nextAppointments = json.data ?? [];
      setAppointments(nextAppointments);
      if (!selected) setAuditLogs([]);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar agenda.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, barberFilter, debouncedQuery, fromDate, toDate]);

  useEffect(() => {
    async function loadBarbers() {
      try {
        const response = await fetch("/api/barbers", { cache: "no-store" });
        const json = await response.json();
        if (response.ok) setBarbers(json.data ?? []);
      } catch {
        // ignore
      }
    }
    loadBarbers();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDetailStatus(selected.status);
    setDetailDate(selected.date);
    setDetailStart(selected.start_time);
    setDetailEnd(selected.end_time);
    setDetailNotes(selected.notes ?? "");
  }, [selected]);

  const loadAuditLogsForAppointment = async (appointmentId: string, force = false) => {
    if (!force && auditLogsCache.current[appointmentId]) {
      setAuditLogs(auditLogsCache.current[appointmentId]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("include_audit", "true");
      params.set("appointment_id", appointmentId);
      const response = await fetch(`/api/appointments?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) return;
      const logs = json.audit_logs ?? [];
      auditLogsCache.current[appointmentId] = logs;
      setAuditLogs(logs);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    if (!selected?.id) return;
    loadAuditLogsForAppointment(selected.id);
  }, [selected?.id]);

  useEffect(() => {
    if (selected || appointments.length === 0) return;
    const firstAppointmentId = appointments[0]?.id;
    if (!firstAppointmentId) return;
    loadAuditLogsForAppointment(firstAppointmentId);
  }, [appointments, selected]);

  const events = useMemo<Event[]>(
    () =>
      appointments.map((item) => ({
        title: `${item.client_name} • ${item.service_name}`,
        start: new Date(`${item.date}T${item.start_time}`),
        end: new Date(`${item.date}T${item.end_time}`),
        resource: item,
      })),
    [appointments]
  );

  const selectedLogs = useMemo(
    () => auditLogs.filter((log) => log.appointment_id === selected?.id).slice(0, 10),
    [auditLogs, selected?.id]
  );

  const saveDetails = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    const previousSelected = selected;
    const optimisticSelected: AdminAppointment = {
      ...selected,
      status: detailStatus,
      date: detailDate,
      start_time: detailStart,
      end_time: detailEnd,
      notes: detailNotes,
    };
    setSelected(optimisticSelected);
    setAppointments((current) =>
      current.map((item) => (item.id === optimisticSelected.id ? { ...item, ...optimisticSelected } : item))
    );
    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          barber_id: selected.barber_id,
          status: detailStatus,
          date: detailDate,
          start_time: detailStart,
          end_time: detailEnd,
          notes: detailNotes,
          action: "appointment_updated_from_agenda",
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Falha ao atualizar agendamento.");
      await loadAuditLogsForAppointment(optimisticSelected.id, true);
      void loadAppointments(true);
    } catch (err: any) {
      setError(err.message || "Falha ao atualizar agendamento.");
      setSelected(previousSelected);
      setAppointments((current) =>
        current.map((item) => (item.id === previousSelected.id ? previousSelected : item))
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <p className="text-muted">Visão operacional com filtros, detalhe e auditoria.</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Filtros operacionais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "all")}>
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="barber-filter">Barbeiro</Label>
            <Select id="barber-filter" value={barberFilter} onChange={(event) => setBarberFilter(event.target.value)}>
              <option value="all">Todos</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="from-date">De</Label>
            <Input id="from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="to-date">Até</Label>
            <Input id="to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="xl:col-span-2">
            <Label htmlFor="query">Busca</Label>
            <Input id="query" placeholder="Cliente ou serviço" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendário de agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[700px] rounded-md overflow-hidden bg-white text-black">
            {loading ? <p className="p-3 text-sm">Carregando agenda...</p> : null}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="pt-BR"
              defaultView="week"
              views={["day", "week", "month"]}
              onSelectEvent={(event) => setSelected(event.resource as AdminAppointment)}
            />
          </div>
        </CardContent>
      </Card>

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle>Detalhe do agendamento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm"><strong>Cliente:</strong> {selected.client_name}</p>
              <p className="text-sm"><strong>Barbeiro:</strong> {selected.barber_name}</p>
              <p className="text-sm"><strong>Serviço:</strong> {selected.service_name}</p>
              <div>
                <Label htmlFor="detail-status">Status</Label>
                <Select id="detail-status" value={detailStatus} onChange={(event) => setDetailStatus(event.target.value as AppointmentStatus)}>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </Select>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <Label htmlFor="detail-date">Data</Label>
                  <Input id="detail-date" type="date" value={detailDate} onChange={(event) => setDetailDate(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="detail-start">Início</Label>
                  <Input id="detail-start" type="time" value={detailStart} onChange={(event) => setDetailStart(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="detail-end">Fim</Label>
                  <Input id="detail-end" type="time" value={detailEnd} onChange={(event) => setDetailEnd(event.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="detail-notes">Observações</Label>
                <Input id="detail-notes" value={detailNotes} onChange={(event) => setDetailNotes(event.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveDetails}>
                  {saving ? "Salvando..." : "Salvar alterações"}
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Fechar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Histórico de auditoria</h3>
              {selectedLogs.length === 0 ? <p className="text-sm text-muted">Sem eventos registrados.</p> : null}
              {selectedLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-border p-2 text-sm">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-muted">
                    {log.old_status ?? "-"} → {log.new_status ?? "-"} • {new Date(log.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-muted">{log.actor_email ?? "sistema"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
