"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleDollarSign, LayoutDashboard, Scissors, Settings, Users, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/barbeiros", label: "Barbeiros", icon: UserRound },
  { href: "/financeiro", label: "Financeiro", icon: CircleDollarSign },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-border bg-card/50 p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="h-10 w-10 overflow-hidden rounded-md border border-gold/25 bg-black/80 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
          <img
            src="/api/brand-logo"
            alt="Logo Bárbaros"
            className="h-full w-full object-contain p-1.5"
            loading="eager"
          />
        </div>
        <div>
          <p className="text-sm text-muted">Bárbaros</p>
          <h1 className="text-base font-semibold">Admin Panel</h1>
        </div>
      </div>

      <nav className="space-y-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-gold text-black font-semibold" : "text-foreground hover:bg-background"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
