import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "strict" });
  return res;
}
