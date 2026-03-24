import { promises as fs } from "node:fs";
import path from "node:path";

function buildCandidates() {
  const cwd = process.cwd();
  return [
    path.join(cwd, "..", "public", "favicon-barbaros.png"),
    path.join(cwd, "public", "favicon-barbaros.png"),
    path.join(cwd, "public", "favicon.ico"),
  ];
}

export async function GET() {
  const candidates = buildCandidates();

  for (const filePath of candidates) {
    try {
      const content = await fs.readFile(filePath);
      const isPng = filePath.toLowerCase().endsWith(".png");
      return new Response(content, {
        status: 200,
        headers: {
          "Content-Type": isPng ? "image/png" : "image/x-icon",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // Tenta o proximo caminho.
    }
  }

  return new Response("Logo nao encontrada.", { status: 404 });
}
