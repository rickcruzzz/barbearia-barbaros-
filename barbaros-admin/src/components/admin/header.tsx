"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AdminHeader() {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/60 px-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">Painel de gestão</p>
        <h2 className="text-lg font-semibold">Bárbaros Barbershop</h2>
      </div>

      <Button variant="outline" onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </header>
  );
}
