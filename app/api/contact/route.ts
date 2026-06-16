import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("New Legacy Verses inquiry:", body);
  return NextResponse.json({ ok: true });
}
