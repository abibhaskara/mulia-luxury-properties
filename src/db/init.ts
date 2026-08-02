import { client } from "./index";

export async function initDb() {
  // Create tables if not exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      kode TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'AVAILABLE',
      jenis TEXT,
      lokasi_area TEXT NOT NULL,
      alamat_lengkap TEXT,
      latitude REAL,
      longitude REAL,
      luas_tanah INTEGER,
      luas_bangunan INTEGER,
      kamar_tidur INTEGER DEFAULT 0,
      kamar_mandi INTEGER DEFAULT 0,
      harga REAL NOT NULL,
      sewa_jual TEXT,
      sertifikat TEXT,
      furnished TEXT,
      tahun_bangun INTEGER,
      komisi TEXT,
      nama_pemilik TEXT NOT NULL,
      no_hp TEXT NOT NULL,
      link_foto TEXT,
      link_gdrive TEXT,
      catatan TEXT,
      embedding BLOB,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS buyers (
      id TEXT PRIMARY KEY,
      nama_klien TEXT NOT NULL,
      jenis_dicari TEXT,
      lokasi_dicari TEXT,
      budget_min REAL,
      budget_max REAL,
      lt_min INTEGER,
      lb_min INTEGER,
      kt_min INTEGER,
      catatan TEXT,
      status TEXT DEFAULT 'NEW',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
