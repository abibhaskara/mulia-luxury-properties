export const runtime = 'edge';
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Fungsi dummy seed telah dinonaktifkan." },
    { status: 400 }
  );
}
