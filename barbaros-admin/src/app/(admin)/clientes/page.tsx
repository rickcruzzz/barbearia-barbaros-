"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AdminAppointment, AdminClient } from "@/lib/types";

export default function ClientesPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [segment, setSegment] = useState<"all" | "vip" | "recorrente" | "novo">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clients", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao carregar clientes.");
      setClients(json.data ?? []);
      const appointmentsResponse = await fetch("/api/appointments", { cache: "no-store" });
      const appointmentsJson = await appointmentsResponse.json();
      if (appointmentsResponse.ok) setAppointments(appointmentsJson.data ?? []);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return clients
      .filter((client) => client.name.toLowerCase().includes(term) || client.phone.toLowerCase().includes(term))
      .filter((client) => {
        if (segment === "all") return true;
        if (segment === "vip") return client.total_spent >= 500;
        const visits = appointments.filter((appointment) => appointment.client_id === client.id).length;
        if (segment === "recorrente") return visits >= 3;
        if (segment === "novo") return visits <= 1;
        return true;
      });
  }, [appointments, clients, search, segment]);

  const selectedHistory = useMemo(
    () => appointments.filter((appointment) => appointment.client_id === selectedClientId).slice(0, 12),
    [appointments, selectedClientId]
  );

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao criar cliente.");
      setClients((current) => [json.data, ...current]);
      setForm({ name: "", phone: "", email: "" });
    } catch (err: any) {
      setError(err.message || "Falha ao criar cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-muted">CRM básico com busca e histórico de gastos.</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={onCreate}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm((old) => ({ ...old, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((old) => ({ ...old, email: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar cliente"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={segment} onChange={(e) => setSegment(e.target.value as "all" | "vip" | "recorrente" | "novo")}>
              <option value="all">Todos os segmentos</option>
              <option value="vip">VIP (gasto &gt;= R$ 500)</option>
              <option value="recorrente">Recorrente (3+ visitas)</option>
              <option value="novo">Novo (0-1 visita)</option>
            </Select>
          </div>
          {loading ? <p className="text-sm text-muted">Carregando clientes...</p> : null}
          {!loading && filtered.map((client) => (
            <button
              key={client.id}
              type="button"
              className={`w-full rounded-md border p-3 text-left ${selectedClientId === client.id ? "border-gold" : "border-border"}`}
              onClick={() => setSelectedClientId(client.id)}
            >
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-muted">{client.phone} • {client.email}</p>
              <p className="text-sm mt-1">Total gasto: <strong>R$ {Number(client.total_spent).toFixed(2)}</strong></p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico do cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!selectedClientId ? <p className="text-sm text-muted">Selecione um cliente para ver o histórico.</p> : null}
          {selectedClientId && selectedHistory.length === 0 ? <p className="text-sm text-muted">Sem atendimentos para este cliente.</p> : null}
          {selectedHistory.map((appointment) => (
            <div key={appointment.id} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">{appointment.service_name}</p>
              <p className="text-muted">
                {appointment.date} • {appointment.start_time} - {appointment.end_time} • {appointment.barber_name}
              </p>
              <p className="text-muted">Status: {appointment.status} • Pago: R$ {Number(appointment.amount_paid).toFixed(2)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
