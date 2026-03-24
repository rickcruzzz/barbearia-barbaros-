import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireRole } from "@/lib/authz";

const BUCKET = "barber-photos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForType(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado para upload." }, { status: 503 });
  }

  const supabase = createClient();
  const permission = await requireRole(supabase, ["admin"]);
  if ("response" in permission) return permission.response;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo de imagem obrigatório." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WEBP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Imagem acima de 5MB." }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  const extension = extensionForType(file.type);
  const objectPath = `barbers/${user.id}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const upload = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return NextResponse.json({ data: { path: objectPath, publicUrl: publicData.publicUrl } });
}
