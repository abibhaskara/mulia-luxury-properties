export const runtime = 'edge';
import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, buyers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEmbedding, cosineSimilarity, generateMatchPitch } from "@/lib/ai";
import { initDb } from "@/db/init";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { buyerId, customQuery } = body;

    let buyer: any = null;
    if (buyerId) {
      const found = await db.select().from(buyers).where(eq(buyers.id, buyerId));
      if (found.length > 0) {
        buyer = found[0];
      }
    }

    if (!buyer && !customQuery) {
      return NextResponse.json(
        { success: false, error: "Buyer ID or custom match query is required" },
        { status: 400 }
      );
    }

    // Build requirement text summary for embedding
    const buyerSummary = buyer
      ? `Ingin membeli/sewa ${buyer.jenis_dicari || "properti"} di lokasi ${buyer.lokasi_dicari || ""}. Budget Rp ${
          buyer.budget_min || 0
        } sampai Rp ${buyer.budget_max || 0}. Kamar tidur minimal ${buyer.kt_min || 0}, LT minimal ${
          buyer.lt_min || 0
        }m2. Catatan khusus: ${buyer.catatan || ""}`
      : customQuery;

    // Generate embedding for buyer preference
    const buyerVec = await getEmbedding(buyerSummary);

    // Fetch all listings
    const allListings = await db.select().from(listings);

    const matches = await Promise.all(
      allListings.map(async (item) => {
        let vectorScore = 0;
        if (item.embedding && Array.isArray(item.embedding) && item.embedding.length > 0) {
          vectorScore = cosineSimilarity(buyerVec, item.embedding);
        } else {
          // If item has no embedding, generate on the fly
          const itemText = `Properti ${item.jenis} di ${item.lokasi_area}. Harga Rp ${item.harga}. ${item.luas_tanah}m2 LT, ${item.luas_bangunan}m2 LB, ${item.kamar_tidur} kamar tidur. ${item.catatan}`;
          const itemVec = await getEmbedding(itemText);
          vectorScore = cosineSimilarity(buyerVec, itemVec);
        }

        // Calculate Hard Rule Score Bonus (0.0 to 1.0)
        let ruleScore = 0;
        let checksPassed = 0;
        let totalChecks = 4;

        if (buyer) {
          // 1. Jenis Properti check
          if (!buyer.jenis_dicari || buyer.jenis_dicari === "ANY" || item.jenis?.toUpperCase() === buyer.jenis_dicari?.toUpperCase()) {
            checksPassed += 1;
          }
          // 2. Lokasi check
          if (!buyer.lokasi_dicari || item.lokasi_area?.toLowerCase().includes(buyer.lokasi_dicari.toLowerCase()) || buyer.lokasi_dicari.toLowerCase().includes(item.lokasi_area?.toLowerCase())) {
            checksPassed += 1;
          }
          // 3. Budget check
          if (
            (!buyer.budget_min || item.harga >= buyer.budget_min * 0.8) &&
            (!buyer.budget_max || item.harga <= buyer.budget_max * 1.2)
          ) {
            checksPassed += 1;
          }
          // 4. Kamar Tidur check
          if (!buyer.kt_min || (item.kamar_tidur || 0) >= buyer.kt_min) {
            checksPassed += 1;
          }

          ruleScore = checksPassed / totalChecks;
        } else {
          ruleScore = vectorScore;
        }

        // Weighted Final Score: 60% Vector Similarity + 40% Rule Criteria
        const combinedScore = vectorScore * 0.6 + ruleScore * 0.4;
        const matchPct = Math.min(Math.round(combinedScore * 100), 99);

        return {
          listing: item,
          matchPercentage: Math.max(matchPct, 30),
          vectorScore: Math.round(vectorScore * 100),
          ruleScore: Math.round(ruleScore * 100),
        };
      })
    );

    // Sort descending by match percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Generate AI pitch for top 3 matches
    const topMatches = await Promise.all(
      matches.slice(0, 5).map(async (m) => {
        const pitch = buyer
          ? await generateMatchPitch(buyer, m.listing, m.matchPercentage)
          : `Properti ini merupakan padanan yang kuat (${m.matchPercentage}%) untuk kriteria pencarian Anda.`;

        return {
          ...m,
          aiPitch: pitch,
        };
      })
    );

    const remainingMatches = matches.slice(5).map((m) => ({
      ...m,
      aiPitch: `Properti di ${m.listing.lokasi_area} dengan harga Rp ${m.listing.harga.toLocaleString()}.`,
    }));

    return NextResponse.json({
      success: true,
      buyer,
      data: [...topMatches, ...remainingMatches],
    });
  } catch (error: any) {
    console.error("POST /api/match error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
