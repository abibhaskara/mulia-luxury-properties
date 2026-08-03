export const runtime = 'edge';
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEmbedding } from "@/lib/ai";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db.select().from(listings).where(eq(listings.id, id));
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.select().from(listings).where(eq(listings.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }

    const textSummary = `Properti ${body.jenis || existing[0].jenis} di ${body.lokasi_area || existing[0].lokasi_area}. Harga Rp ${body.harga || existing[0].harga}. ${
      body.luas_tanah || existing[0].luas_tanah
    }m2 LT, ${body.luas_bangunan || existing[0].luas_bangunan}m2 LB. ${body.catatan || existing[0].catatan}`;
    
    const embedding = await getEmbedding(textSummary);

    const updateData = {
      ...body,
      latitude: body.latitude ? parseFloat(body.latitude) : existing[0].latitude,
      longitude: body.longitude ? parseFloat(body.longitude) : existing[0].longitude,
      luas_tanah: body.luas_tanah ? parseInt(body.luas_tanah) : existing[0].luas_tanah,
      luas_bangunan: body.luas_bangunan ? parseInt(body.luas_bangunan) : existing[0].luas_bangunan,
      kamar_tidur: body.kamar_tidur !== undefined ? parseInt(body.kamar_tidur) : existing[0].kamar_tidur,
      kamar_mandi: body.kamar_mandi !== undefined ? parseInt(body.kamar_mandi) : existing[0].kamar_mandi,
      harga: body.harga ? parseFloat(body.harga) : existing[0].harga,
      embedding,
      updatedAt: new Date().toISOString(),
    };

    await db.update(listings).set(updateData).where(eq(listings.id, id));

    return NextResponse.json({ success: true, data: { ...existing[0], ...updateData } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(listings).where(eq(listings.id, id));
    return NextResponse.json({ success: true, message: "Listing deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
