import { auth } from "@/lib/auth";
import { fetchKind0ProfilesFromPublic } from "@/lib/public-kind0-bootstrap";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PUBKEYS = 24;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("pubkeys") ?? "";
  const pubkeys = raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_PUBKEYS);

  if (pubkeys.length === 0) {
    return NextResponse.json({ profiles: {} });
  }

  try {
    const profiles = await fetchKind0ProfilesFromPublic(pubkeys);
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ profiles: {} });
  }
}
