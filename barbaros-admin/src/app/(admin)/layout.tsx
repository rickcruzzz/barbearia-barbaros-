import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
