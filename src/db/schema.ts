import { sqliteTable, text, integer, real, customType } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const f32Blob = customType<{ data: number[]; driverData: Buffer }>({
  dataType() {
    return "F32_BLOB(768)";
  },
  toDriver(value: number[]): Buffer {
    if (!value || !Array.isArray(value)) return Buffer.alloc(768 * 4);
    const f32 = new Float32Array(768);
    for (let i = 0; i < Math.min(value.length, 768); i++) {
      f32[i] = value[i];
    }
    return Buffer.from(f32.buffer);
  },
  fromDriver(value: unknown): number[] {
    if (!value) return new Array(768).fill(0);
    if (Buffer.isBuffer(value)) {
      const f32 = new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4);
      return Array.from(f32);
    }
    if (value instanceof Uint8Array) {
      const f32 = new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4);
      return Array.from(f32);
    }
    if (Array.isArray(value)) return value;
    return new Array(768).fill(0);
  },
});

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(), // UUID
  kode: text("kode").unique().notNull(),
  status: text("status").default("AVAILABLE"), // AVAILABLE, BOOKING, SOLD
  jenis: text("jenis"), // RUMAH, RUKO, TANAH, VILLA
  lokasi_area: text("lokasi_area").notNull(),
  alamat_lengkap: text("alamat_lengkap"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  luas_tanah: integer("luas_tanah"),
  luas_bangunan: integer("luas_bangunan"),
  kamar_tidur: integer("kamar_tidur").default(0),
  kamar_mandi: integer("kamar_mandi").default(0),
  harga: real("harga").notNull(),
  sewa_jual: text("sewa_jual"), // SEWA, JUAL
  sertifikat: text("sertifikat"),
  furnished: text("furnished"), // FULL, SEMI, NON
  tahun_bangun: integer("tahun_bangun"),
  komisi: text("komisi"), 
  nama_pemilik: text("nama_pemilik").notNull(),
  no_hp: text("no_hp").notNull(),
  link_foto: text("link_foto", { mode: "json" }).$type<string[]>(), 
  link_gdrive: text("link_gdrive"),
  catatan: text("catatan"),
  embedding: f32Blob("embedding"), // Store Gemini text-embedding
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const buyers = sqliteTable("buyers", {
  id: text("id").primaryKey(), // UUID
  nama_klien: text("nama_klien").notNull(),
  jenis_dicari: text("jenis_dicari"),
  lokasi_dicari: text("lokasi_dicari"),
  budget_min: real("budget_min"),
  budget_max: real("budget_max"),
  lt_min: integer("lt_min"),
  lb_min: integer("lb_min"),
  kt_min: integer("kt_min"),
  catatan: text("catatan"),
  status: text("status").default("NEW"), // NEW, CONTACTED, VIEWING, NEGOTIATION, CLOSED
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Buyer = typeof buyers.$inferSelect;
export type NewBuyer = typeof buyers.$inferInsert;
