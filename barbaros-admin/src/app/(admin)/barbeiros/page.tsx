"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AdminBarber } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type BarberForm = {
  name: string;
  email: string;
  commission_pct: string;
  role: "admin" | "barbeiro";
  photo_url: string;
};

const MAX_PHOTO_MB = 5;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.readAsDataURL(file);
  });
}

async function optimizeImageDataUrl(file: File) {
  const inputDataUrl = await readFileAsDataUrl(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Imagem inválida."));
    img.src = inputDataUrl;
  });

  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return inputDataUrl;

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export default function BarbeirosPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [form, setForm] = useState<BarberForm>({ name: "", email: "", commission_pct: "40", role: "barbeiro", photo_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BarberForm>({ name: "", email: "", commission_pct: "40", role: "barbeiro", photo_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [error, setError] = useState("");

  const loadBarbers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/barbers", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao carregar barbeiros.");
      setBarbers(json.data ?? []);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar barbeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          commission_pct: Number(form.commission_pct || 40),
          role: form.role,
          photo_url: form.photo_url || null,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao criar barbeiro.");
      setBarbers((current) => [json.data, ...current]);
      setForm({ name: "", email: "", commission_pct: "40", role: "barbeiro", photo_url: "" });
    } catch (err: any) {
      setError(err.message || "Falha ao criar barbeiro.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFile = async (file: File, mode: "create" | "edit") => {
    if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      throw new Error(`A imagem deve ter no máximo ${MAX_PHOTO_MB}MB.`);
    }

    const setUploading = mode === "create" ? setUploadingCreate : setUploadingEdit;
    setUploading(true);
    try {
      if (hasSupabaseEnv()) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/uploads/barber-photo", { method: "POST", body: formData });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Falha no upload da foto.");
        const publicUrl = String(json?.data?.publicUrl ?? "");
        if (!publicUrl) throw new Error("URL da imagem não retornada.");
        if (mode === "create") {
          setForm((old) => ({ ...old, photo_url: publicUrl }));
        } else {
          setEditForm((old) => ({ ...old, photo_url: publicUrl }));
        }
        return;
      }

      const toDataUrl = await optimizeImageDataUrl(file);
      if (mode === "create") {
        setForm((old) => ({ ...old, photo_url: toDataUrl }));
      } else {
        setEditForm((old) => ({ ...old, photo_url: toDataUrl }));
      }
    } finally {
      setUploading(false);
    }
  };

  const onToggle = async (id: string, nextValue: boolean) => {
    setError("");
    const previous = barbers;
    setBarbers((current) => current.map((barber) => (barber.id === id ? { ...barber, is_active: nextValue } : barber)));
    const response = await fetch("/api/barbers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: nextValue }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error || "Falha ao atualizar barbeiro.");
      setBarbers(previous);
    }
  };

  const onStartEdit = (barber: AdminBarber) => {
    setEditingId(barber.id);
    setEditForm({
      name: barber.name,
      email: barber.email,
      commission_pct: String(barber.commission_pct ?? 40),
      role: barber.role,
      photo_url: barber.photo_url ?? "",
    });
  };

  const onSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/barbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          commission_pct: Number(editForm.commission_pct || 40),
          photo_url: editForm.photo_url || null,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Falha ao editar barbeiro.");
      setBarbers((current) =>
        current.map((barber) =>
          barber.id === editingId
            ? {
                ...barber,
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
                commission_pct: Number(editForm.commission_pct || 40),
                photo_url: editForm.photo_url || null,
              }
            : barber
        )
      );
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || "Falha ao editar barbeiro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Barbeiros</h1>
        <p className="text-muted">Gestão de equipe, comissão e disponibilidade.</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo barbeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((old) => ({ ...old, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input id="commission" type="number" value={form.commission_pct} onChange={(e) => setForm((old) => ({ ...old, commission_pct: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="role">Perfil</Label>
              <Select id="role" value={form.role} onChange={(e) => setForm((old) => ({ ...old, role: e.target.value as "admin" | "barbeiro" }))}>
                <option value="barbeiro">Barbeiro</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="md:col-span-2 rounded-md border border-border p-3">
              <Label className="mb-3 block">Foto de perfil</Label>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-border bg-background grid place-items-center text-sm font-semibold">
                  {form.photo_url ? <img src={form.photo_url} alt="Prévia do barbeiro" className="h-full w-full object-cover" /> : "Sem foto"}
                </div>
                <div className="flex items-center gap-2">
                  <label className="btn-outline-gold cursor-pointer px-3 py-2 text-xs">
                    {uploadingCreate ? "Enviando..." : "Upload da foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCreate}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          await handlePhotoFile(file, "create");
                        } catch (err: any) {
                          setError(err.message || "Falha ao carregar imagem.");
                        }
                      }}
                    />
                  </label>
                  {form.photo_url ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForm((old) => ({ ...old, photo_url: "" }))}
                    >
                      Remover
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving || uploadingCreate}>
                {saving ? "Salvando..." : uploadingCreate ? "Enviando foto..." : "Adicionar barbeiro"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipe atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted">Carregando equipe...</p> : null}
          {!loading && barbers.map((barber) => (
            <div key={barber.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-background grid place-items-center text-sm font-semibold">
                    {barber.photo_url ? (
                      <img src={barber.photo_url} alt={`Foto de ${barber.name}`} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(barber.name)
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{barber.name}</p>
                    <p className="text-sm text-muted">{barber.email} • Comissão {barber.commission_pct}% • {barber.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onStartEdit(barber)}>
                    Editar
                  </Button>
                  <Button variant={barber.is_active ? "outline" : "default"} onClick={() => onToggle(barber.id, !barber.is_active)}>
                    {barber.is_active ? "Inativar" : "Ativar"}
                  </Button>
                </div>
              </div>

              {editingId === barber.id ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Input value={editForm.name} onChange={(e) => setEditForm((old) => ({ ...old, name: e.target.value }))} placeholder="Nome" />
                  <Input value={editForm.email} onChange={(e) => setEditForm((old) => ({ ...old, email: e.target.value }))} placeholder="E-mail" />
                  <Input
                    type="number"
                    value={editForm.commission_pct}
                    onChange={(e) => setEditForm((old) => ({ ...old, commission_pct: e.target.value }))}
                    placeholder="Comissão (%)"
                  />
                  <Select value={editForm.role} onChange={(e) => setEditForm((old) => ({ ...old, role: e.target.value as "admin" | "barbeiro" }))}>
                    <option value="barbeiro">Barbeiro</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <div className="md:col-span-2 rounded-md border border-border p-3">
                    <Label className="mb-3 block">Foto de perfil</Label>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-full border border-border bg-background grid place-items-center text-sm font-semibold">
                        {editForm.photo_url ? <img src={editForm.photo_url} alt="Prévia da edição" className="h-full w-full object-cover" /> : "Sem foto"}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="btn-outline-gold cursor-pointer px-3 py-2 text-xs">
                          {uploadingEdit ? "Enviando..." : "Upload da foto"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingEdit}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                await handlePhotoFile(file, "edit");
                              } catch (err: any) {
                                setError(err.message || "Falha ao carregar imagem.");
                              }
                            }}
                          />
                        </label>
                        {editForm.photo_url ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditForm((old) => ({ ...old, photo_url: "" }))}
                          >
                            Remover
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button disabled={saving || uploadingEdit} onClick={onSaveEdit}>
                      {saving ? "Salvando..." : uploadingEdit ? "Enviando foto..." : "Salvar edição"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
