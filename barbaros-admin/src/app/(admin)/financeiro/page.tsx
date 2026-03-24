"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAppointment, AdminBarber } from "@/lib/types";

function exportCsv(rows: Record<string, string | number>[], filename: string) {
  const headers = Object.keys(rows[0] ?? {});
  const content = [headers.join(","), ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function FinanceiroPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setError("");
      try {
        const [appointmentsResponse, barbersResponse] = await Promise.all([
          fetch("/api/appointments", { cache: "no-store" }),
          fetch("/api/barbers", { cache: "no-store" }),
        ]);
        const appointmentsJson = await appointmentsResponse.json();
        const barbersJson = await barbersResponse.json();
        if (!appointmentsResponse.ok) throw new Error(appointmentsJson.error || "Falha ao carregar agendamentos.");
        if (!barbersResponse.ok) throw new Error(barbersJson.error || "Falha ao carregar barbeiros.");
        setAppointments(appointmentsJson.data ?? []);
        setBarbers(barbersJson.data ?? []);
      } catch (err: any) {
        setError(err.message || "Falha ao carregar dados financeiros.");
      }
    }
    loadData();
  }, []);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((item) => {
        if (fromDate && item.date < fromDate) return false;
        if (toDate && item.date > toDate) return false;
        return true;
      }),
    [appointments, fromDate, toDate]
  );

  const totalRevenue = useMemo(
    () => filteredAppointments.reduce((sum, item) => sum + Number(item.amount_paid ?? 0), 0),
    [filteredAppointments]
  );

  const commissions = useMemo(
    () =>
      barbers.map((barber) => {
        const barberRevenue = filteredAppointments
          .filter((item) => item.barber_id === barber.id || item.barber_name === barber.name)
          .reduce((sum, item) => sum + Number(item.amount_paid ?? 0), 0);
        const commissionValue = (barberRevenue * Number(barber.commission_pct ?? 0)) / 100;
        return { barber: barber.name, revenue: barberRevenue, commission_pct: barber.commission_pct, commission_value: commissionValue };
      }),
    [filteredAppointments, barbers]
  );

  const onExport = () => exportCsv(commissions, "financeiro-comissoes.csv");

  const cashByDay = useMemo(() => {
    const daily = new Map<string, number>();
    filteredAppointments.forEach((item) => {
      daily.set(item.date, (daily.get(item.date) ?? 0) + Number(item.amount_paid ?? 0));
    });
    return Array.from(daily.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 10);
  }, [filteredAppointments]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-muted">Receita diária, comissões e exportação.</p>
        </div>
        <Button onClick={onExport}>Exportar CSV</Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="from-date">De</Label>
            <Input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="to-date">Até</Label>
            <Input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Receita total no período filtrado</p>
          <p className="text-3xl font-semibold mt-1">R$ {totalRevenue.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caixa diário (últimos 10 dias filtrados)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cashByDay.length === 0 ? <p className="text-sm text-muted">Sem registros no período.</p> : null}
          {cashByDay.map(([date, amount]) => (
            <div key={date} className="rounded-md border border-border p-3 flex items-center justify-between">
              <p className="text-sm">{date}</p>
              <p className="font-medium">R$ {amount.toFixed(2)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissão por barbeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {commissions.map((item) => (
            <div key={item.barber} className="rounded-md border border-border p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{item.barber}</p>
                <p className="text-sm text-muted">Receita: R$ {item.revenue.toFixed(2)} • Comissão: {item.commission_pct}%</p>
              </div>
              <p className="font-semibold text-gold">R$ {item.commission_value.toFixed(2)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
