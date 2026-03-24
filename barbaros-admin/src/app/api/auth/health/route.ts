import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseConfigured: hasSupabaseEnv(),
  });
}
