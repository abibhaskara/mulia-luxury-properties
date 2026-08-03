export const runtime = 'edge';
import { NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { initDb } from "@/db/init";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let allBuyers = await db.select().from(buyers);

    if (search) {
      const q = search.toLowerCase();
      allBuyers = allBuyers.filter(
        (b) =>
          b.nama_klien.toLowerCase().includes(q) ||
          (b.lokasi_dicari && b.lokasi_dicari.toLowerCase().includes(q)) ||
          (b.catatan && b.catatan.toLowerCase().includes(q))
      );
    }

    if (status && status !== "ALL") {
      allBuyers = allBuyers.filter((b) => b.status === status);
    }

    return NextResponse.json({ success: true, data: allBuyers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.nama_klien) {
      return NextResponse.json({ success: false, error: "Nama klien wajib diisi" }, { status: 400 });
    }

    const id = body.id || `byr-${randomUUID().substring(0, 8)}`;

    const newBuyer = {
      id,
      nama_klien: body.nama_klien,
      jenis_dicari: body.jenis_dicari || "RUMAH",
      lokasi_dicari: body.lokasi_dicari || "",
      budget_min: body.budget_min ? parseFloat(body.budget_min) : 0,
      budget_max: body.budget_max ? parseFloat(body.budget_max) : 0,
      lt_min: body.lt_min ? parseInt(body.lt_min) : 0,
      lb_min: body.lb_min ? parseInt(body.lb_min) : 0,
      kt_min: body.kt_min ? parseInt(body.kt_min) : 0,
      catatan: body.catatan || "",
      status: body.status || "NEW",
    };

    await db.insert(buyers).values(newBuyer);

    return NextResponse.json({ success: true, data: newBuyer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
