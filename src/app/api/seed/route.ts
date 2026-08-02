import { NextResponse } from "next/server";
import { client, db } from "@/db";
import { listings, buyers } from "@/db/schema";
import { initDb } from "@/db/init";

export async function POST() {
  try {
    // Drop existing records
    await client.execute("DELETE FROM listings;");
    await client.execute("DELETE FROM buyers;");

    // Re-run initDb
    await initDb();

    return NextResponse.json({ success: true, message: "Database re-seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
