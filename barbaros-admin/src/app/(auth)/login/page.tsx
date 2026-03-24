"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!hasSupabaseEnv()) {
        // Modo desenvolvimento sem segredo: libera acesso ao layout mockado
        router.push("/dashboard");
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(201,168,76,0.20),rgba(0,0,0,0.85)_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.70),rgba(0,0,0,0.88))]" />
      <img
        src="/api/brand-logo"
        alt="Marca Barbaros em fundo"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[14%] h-[38vmin] w-[38vmin] max-h-[360px] max-w-[360px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-60"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full place-items-center px-4 py-8 sm:px-6">
        <Card className="w-full max-w-[560px] border-gold/25 bg-card/85 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-3xl font-semibold leading-none tracking-tight">Bárbaros Admin</CardTitle>
            <CardDescription className="text-base">
              Entre com seu e-mail e senha para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
