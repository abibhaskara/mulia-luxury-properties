export const runtime = 'edge';
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { initDb } from "@/db/init";
import { getEmbedding } from "@/lib/ai";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const jenis = searchParams.get("jenis") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let allListings = await db.select().from(listings);

    // Apply in-memory or query filters
    if (search) {
      const q = search.toLowerCase();
      allListings = allListings.filter(
        (item) =>
          item.kode.toLowerCase().includes(q) ||
          item.lokasi_area.toLowerCase().includes(q) ||
          item.nama_pemilik.toLowerCase().includes(q) ||
          (item.catatan && item.catatan.toLowerCase().includes(q))
      );
    }

    if (status && status !== "ALL") {
      allListings = allListings.filter((item) => item.status === status);
    }

    if (jenis && jenis !== "ALL") {
      allListings = allListings.filter((item) => item.jenis === jenis);
    }

    if (minPrice) {
      const minP = parseFloat(minPrice);
      allListings = allListings.filter((item) => item.harga >= minP);
    }

    if (maxPrice) {
      const maxP = parseFloat(maxPrice);
      allListings = allListings.filter((item) => item.harga <= maxP);
    }

    return NextResponse.json({ success: true, data: allListings });
  } catch (error: any) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();

    if (!body.kode || !body.lokasi_area || !body.nama_pemilik || !body.no_hp || body.harga === undefined) {
      return NextResponse.json(
        { success: false, error: "Kode, lokasi area, nama pemilik, no hp, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const id = body.id || `lst-${randomUUID().substring(0, 8)}`;

    const textSummary = `Properti ${body.jenis || ""} di ${body.lokasi_area}. Harga Rp ${body.harga}. ${
      body.luas_tanah || 0
    }m2 LT, ${body.luas_bangunan || 0}m2 LB, ${body.kamar_tidur || 0} kamar tidur. ${body.catatan || ""}`;
    
    const embedding = await getEmbedding(textSummary);

    const newListing = {
      id,
      kode: body.kode,
      status: body.status || "AVAILABLE",
      jenis: body.jenis || "RUMAH",
      lokasi_area: body.lokasi_area,
      alamat_lengkap: body.alamat_lengkap || "",
      latitude: body.latitude ? parseFloat(body.latitude) : -6.2088,
      longitude: body.longitude ? parseFloat(body.longitude) : 106.8456,
      luas_tanah: body.luas_tanah ? parseInt(body.luas_tanah) : 0,
      luas_bangunan: body.luas_bangunan ? parseInt(body.luas_bangunan) : 0,
      kamar_tidur: body.kamar_tidur ? parseInt(body.kamar_tidur) : 0,
      kamar_mandi: body.kamar_mandi ? parseInt(body.kamar_mandi) : 0,
      harga: parseFloat(body.harga),
      sewa_jual: body.sewa_jual || "JUAL",
      sertifikat: body.sertifikat || "SHM",
      furnished: body.furnished || "NON",
      tahun_bangun: body.tahun_bangun ? parseInt(body.tahun_bangun) : new Date().getFullYear(),
      komisi: body.komisi || "2%",
      nama_pemilik: body.nama_pemilik,
      no_hp: body.no_hp,
      link_foto: Array.isArray(body.link_foto) ? body.link_foto : [],
      link_gdrive: body.link_gdrive || "",
      catatan: body.catatan || "",
      embedding,
    };

    await db.insert(listings).values(newListing);

    return NextResponse.json({ success: true, data: newListing });
  } catch (error: any) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
