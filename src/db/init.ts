import { client, db } from "./index";
import { listings, buyers } from "./schema";
import { getEmbedding } from "@/lib/ai";
import { randomUUID } from "crypto";

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

  // Check if listings are already populated
  const existingCount = await db.select().from(listings);
  if (existingCount.length > 0) {
    return; // Already initialized
  }

  // Seed sample high quality property listings
  const initialListings = [
    {
      id: "lst-001",
      kode: "HS-VIL-001",
      status: "AVAILABLE",
      jenis: "VILLA",
      lokasi_area: "Canggu, Bali",
      alamat_lengkap: "Jl. Pantai Batu Bolong No. 88, Canggu, Badung, Bali",
      latitude: -8.6500,
      longitude: 115.1381,
      luas_tanah: 450,
      luas_bangunan: 320,
      kamar_tidur: 4,
      kamar_mandi: 4,
      harga: 7500000000, // 7.5 M
      sewa_jual: "JUAL",
      sertifikat: "SHM",
      furnished: "FULL",
      tahun_bangun: 2023,
      komisi: "2.5%",
      nama_pemilik: "Budi Santoso",
      no_hp: "081234567890",
      link_foto: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      link_gdrive: "https://drive.google.com/drive/folders/sample-canggu-villa",
      catatan: "Modern Tropical Luxury Villa dengan private infinity pool, view sawah, full furnished marmer premium, dan ROI sewa harian tinggi."
    },
    {
      id: "lst-002",
      kode: "HS-RMH-002",
      status: "AVAILABLE",
      jenis: "RUMAH",
      lokasi_area: "Pondok Indah, Jakarta Selatan",
      alamat_lengkap: "Jl. Metro Pondok Indah Blok III No. 12, Jakarta Selatan",
      latitude: -6.2750,
      longitude: 106.7820,
      luas_tanah: 600,
      luas_bangunan: 500,
      kamar_tidur: 5,
      kamar_mandi: 5,
      harga: 22500000000, // 22.5 M
      sewa_jual: "JUAL",
      sertifikat: "SHM",
      furnished: "SEMI",
      tahun_bangun: 2021,
      komisi: "2%",
      nama_pemilik: "Hendra Wijaya",
      no_hp: "081198765432",
      link_foto: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
      ],
      link_gdrive: "https://drive.google.com/drive/folders/sample-pi-house",
      catatan: "Rumah megah 2 lantai di kawasan elite Pondok Indah, dekat Mall, sekolah internasional, dilengkapi basement garage 4 mobil dan kolam renang."
    },
    {
      id: "lst-003",
      kode: "HS-RKO-003",
      status: "BOOKING",
      jenis: "RUKO",
      lokasi_area: "BSD City, Tangerang Selatan",
      alamat_lengkap: "Ruko Foresta Business Loft No. 15, BSD City",
      latitude: -6.3015,
      longitude: 106.6534,
      luas_tanah: 120,
      luas_bangunan: 360,
      kamar_tidur: 1,
      kamar_mandi: 3,
      harga: 5800000000, // 5.8 M
      sewa_jual: "JUAL",
      sertifikat: "HGB",
      furnished: "NON",
      tahun_bangun: 2022,
      komisi: "3%",
      nama_pemilik: "CV Maju Bersama (Ibu Susan)",
      no_hp: "081765432109",
      link_foto: [
        "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
      ],
      link_gdrive: "https://drive.google.com/drive/folders/sample-bsd-ruko",
      catatan: "Ruko premium 3.5 lantai menghadap jalan utama BSD Boulevard, cocok untuk kantor, kafe, atau klinik kecantikan."
    },
    {
      id: "lst-004",
      kode: "HS-TNH-004",
      status: "AVAILABLE",
      jenis: "TANAH",
      lokasi_area: "Uluwatu, Bali",
      alamat_lengkap: "Jl. Raya Uluwatu Pecatu, Kuta Selatan, Bali",
      latitude: -8.8149,
      longitude: 115.1186,
      luas_tanah: 2000,
      luas_bangunan: 0,
      kamar_tidur: 0,
      kamar_mandi: 0,
      harga: 16000000000, // 16 M
      sewa_jual: "JUAL",
      sertifikat: "SHM",
      furnished: "NON",
      tahun_bangun: 0,
      komisi: "2.5%",
      nama_pemilik: "I Wayan Sudiarta",
      no_hp: "085987654321",
      link_foto: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
      ],
      link_gdrive: "https://drive.google.com/drive/folders/sample-uluwatu-land",
      catatan: "Kavling tanah spektakuler dengan Cliffside Sunset Ocean View di Uluwatu. Kontur mendatar, legalitas lengkap, siap bangun resor/villa."
    },
    {
      id: "lst-005",
      kode: "HS-RMH-005",
      status: "AVAILABLE",
      jenis: "RUMAH",
      lokasi_area: "Dago Pakar, Bandung",
      alamat_lengkap: "Residen Dago Pakar Resort Blok F No. 7, Bandung",
      latitude: -6.8640,
      longitude: 107.6360,
      luas_tanah: 350,
      luas_bangunan: 280,
      kamar_tidur: 4,
      kamar_mandi: 3,
      harga: 4200000000, // 4.2 M
      sewa_jual: "SEWA",
      sertifikat: "SHM",
      furnished: "FULL",
      tahun_bangun: 2020,
      komisi: "1 bulan sewa",
      nama_pemilik: "Dr. Rizky Ramadhan",
      no_hp: "081321098765",
      link_foto: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
      ],
      link_gdrive: "https://drive.google.com/drive/folders/sample-dago-house",
      catatan: "Villa/Rumah sewa di bukit Dago Pakar dengan pemandangan lanskap kota Bandung, udara sejuk, interior Scandinavian minimalis."
    }
  ];

  for (const listing of initialListings) {
    const textSummary = `Properti ${listing.jenis} di ${listing.lokasi_area}. Harga Rp ${listing.harga}. ${listing.luas_tanah}m2 LT, ${listing.luas_bangunan}m2 LB, ${listing.kamar_tidur} kamar tidur. ${listing.catatan}`;
    const embed = await getEmbedding(textSummary);
    await db.insert(listings).values({
      ...listing,
      embedding: embed,
    });
  }

  // Seed initial Buyers
  const initialBuyers = [
    {
      id: "byr-001",
      nama_klien: "Siti Rahmawati",
      jenis_dicari: "VILLA",
      lokasi_dicari: "Bali",
      budget_min: 5000000000,
      budget_max: 9000000000,
      lt_min: 300,
      lb_min: 250,
      kt_min: 3,
      catatan: "Mencari villa untuk investasi sewa turis di Canggu/Seminyak Bali, butuh private pool dan full furnished.",
      status: "NEW"
    },
    {
      id: "byr-002",
      nama_klien: "Ir. Michael Tan",
      jenis_dicari: "RUMAH",
      lokasi_dicari: "Jakarta Selatan",
      budget_min: 15000000000,
      budget_max: 25000000000,
      lt_min: 500,
      lb_min: 400,
      kt_min: 4,
      catatan: "Sedang mencari hunian tempat tinggal di Pondok Indah atau Kebayoran Baru, halaman luas, garasi muat 3+ mobil.",
      status: "VIEWING"
    },
    {
      id: "byr-003",
      nama_klien: "Kevin Pratama",
      jenis_dicari: "RUKO",
      lokasi_dicari: "Tangerang / BSD",
      budget_min: 4000000000,
      budget_max: 7000000000,
      lt_min: 100,
      lb_min: 250,
      kt_min: 0,
      catatan: "Butuh Ruko untuk ekspansi cabang resto & coffee shop baru di daerah ramai BSD / Gading Serpong.",
      status: "CONTACTED"
    }
  ];

  for (const buyer of initialBuyers) {
    await db.insert(buyers).values(buyer);
  }
}
