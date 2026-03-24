"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  const [form, setForm] = useState({
    name: "Bárbaros Barbershop",
    address: "Stella Maris, Salvador/BA",
    phone: "(71) 98354-2132",
    whatsapp: "5571983542132",
    instagram: "@barbaros",
    interval: "30",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Falha ao carregar configurações.");
        const data = json.data ?? {};
        setForm({
          name: data.name ?? "Bárbaros Barbershop",
          address: data.address ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          instagram: data.instagram ?? "",
          interval: String(data.interval ?? 30),
        });
      } catch (err: any) {
        setError(err.message || "Falha ao carregar configurações.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao salvar configurações.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Falha ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted">Dados da barbearia e regras de agenda.</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Carregando configurações...</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Dados gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSave}>
            <div>
              <Label htmlFor="barbershopName">Nome da barbearia</Label>
              <Input id="barbershopName" value={form.name} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm((old) => ({ ...old, address: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm((old) => ({ ...old, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm((old) => ({ ...old, whatsapp: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" value={form.instagram} onChange={(e) => setForm((old) => ({ ...old, instagram: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="interval">Intervalo entre atendimentos (min)</Label>
              <Input id="interval" type="number" value={form.interval} onChange={(e) => setForm((old) => ({ ...old, interval: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar configurações"}</Button>
              {saved ? <span className="text-sm text-gold">Configurações salvas com sucesso.</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
