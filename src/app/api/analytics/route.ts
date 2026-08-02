import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, buyers } from "@/db/schema";
import { initDb } from "@/db/init";

export async function GET() {
  try {
    await initDb();
    const allListings = await db.select().from(listings);
    const allBuyers = await db.select().from(buyers);

    const totalListings = allListings.length;
    const availableListings = allListings.filter((l) => l.status === "AVAILABLE").length;
    const bookingListings = allListings.filter((l) => l.status === "BOOKING").length;
    const soldListings = allListings.filter((l) => l.status === "SOLD").length;

    const totalPortfolioValue = allListings.reduce((sum, l) => sum + (l.harga || 0), 0);

    // Distribution by Jenis
    const jenisCounts: Record<string, number> = {};
    allListings.forEach((l) => {
      const type = l.jenis || "Lainnya";
      jenisCounts[type] = (jenisCounts[type] || 0) + 1;
    });

    const jenisData = Object.keys(jenisCounts).map((key) => ({
      name: key,
      value: jenisCounts[key],
    }));

    // Distribution by Status
    const statusData = [
      { name: "Available", value: availableListings, fill: "#10B981" },
      { name: "Booking", value: bookingListings, fill: "#F59E0B" },
      { name: "Sold", value: soldListings, fill: "#EF4444" },
    ];

    // Buyer Status Breakdown
    const buyerStatusCounts: Record<string, number> = {};
    allBuyers.forEach((b) => {
      const st = b.status || "NEW";
      buyerStatusCounts[st] = (buyerStatusCounts[st] || 0) + 1;
    });

    const buyerPipelineData = [
      { stage: "NEW", label: "Prospek Baru", count: buyerStatusCounts["NEW"] || 0 },
      { stage: "CONTACTED", label: "Sudah Dikontak", count: buyerStatusCounts["CONTACTED"] || 0 },
      { stage: "VIEWING", label: "Survei Lokasi", count: buyerStatusCounts["VIEWING"] || 0 },
      { stage: "NEGOTIATION", label: "Negosiasi", count: buyerStatusCounts["NEGOTIATION"] || 0 },
      { stage: "CLOSED", label: "Deal Closed", count: buyerStatusCounts["CLOSED"] || 0 },
    ];

    // Area Distribution
    const areaCounts: Record<string, number> = {};
    allListings.forEach((l) => {
      const area = l.lokasi_area.split(",")[0] || l.lokasi_area;
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    const areaData = Object.keys(areaCounts).map((area) => ({
      area,
      count: areaCounts[area],
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalListings,
        availableListings,
        bookingListings,
        soldListings,
        totalPortfolioValue,
        totalBuyers: allBuyers.length,
      },
      charts: {
        jenisData,
        statusData,
        buyerPipelineData,
        areaData,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
