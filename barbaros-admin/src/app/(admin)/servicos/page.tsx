"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminService } from "@/lib/types";

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

export default function ServicosPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [form, setForm] = useState<ServiceForm>({ name: "", description: "", price: "", duration: "30" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/services", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao carregar serviços.");
      setServices(json.data ?? []);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const totalActive = useMemo(() => services.filter((service) => service.is_active).length, [services]);

  const onAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price || 0),
          duration_minutes: Number(form.duration || 30),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao criar serviço.");
      setServices((current) => [json.data, ...current]);
      setForm({ name: "", description: "", price: "", duration: "30" });
    } catch (err: any) {
      setError(err.message || "Falha ao criar serviço.");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (id: string, nextValue: boolean) => {
    setError("");
    const previous = services;
    setServices((current) => current.map((service) => (service.id === id ? { ...service, is_active: nextValue } : service)));
    const response = await fetch("/api/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: nextValue }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error || "Falha ao atualizar serviço.");
      setServices(previous);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Serviços</h1>
          <p className="text-muted">Gestão de preço, duração e status dos serviços.</p>
        </div>
        <p className="text-sm text-muted">Ativos: {totalActive}</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onAdd}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" value={form.price} onChange={(e) => setForm((old) => ({ ...old, price: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm((old) => ({ ...old, description: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input id="duration" type="number" value={form.duration} onChange={(e) => setForm((old) => ({ ...old, duration: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar serviço"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de serviços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted">Carregando serviços...</p> : null}
          {!loading && services.map((service) => (
            <div key={service.id} className="rounded-md border border-border p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted">
                  R$ {Number(service.price).toFixed(2)} • {service.duration_minutes} min • {service.description}
                </p>
              </div>
              <Button variant={service.is_active ? "outline" : "default"} onClick={() => onToggle(service.id, !service.is_active)}>
                {service.is_active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
