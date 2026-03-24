import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabaseConfigured = hasSupabaseEnv();

  if (!supabaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        checks: {
          env: false,
          database: false,
          storage: false,
        },
        message: "Variáveis do Supabase não configuradas.",
      },
      { status: 503 }
    );
  }

  const supabase = createClient();

  const [{ error: dbError }, { data: buckets, error: storageError }] = await Promise.all([
    supabase.from("barbers").select("id", { head: true, count: "exact" }).limit(1),
    supabase.storage.listBuckets(),
  ]);

  const storageReady = !storageError && (buckets ?? []).some((bucket) => bucket.name === "barber-photos");
  const databaseReady = !dbError;
  const ok = databaseReady && storageReady;

  return NextResponse.json(
    {
      ok,
      checks: {
        env: true,
        database: databaseReady,
        storage: storageReady,
      },
      errors: {
        database: dbError?.message ?? null,
        storage: storageError?.message ?? null,
      },
    },
    { status: ok ? 200 : 503 }
  );
}
