"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ─── Chart Colors ─────────────────────────────────────────────────────────
const CHART_COLORS = ["#111111", "#6366f1", "#16a34a", "#d97706", "#9ca3af"];

export default function AnalyticsView() {
  const [data, setData]         = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res  = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div
            className="w-9 h-9 border-[2.5px] border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: "#111", borderTopColor: "transparent" }}
          />
          <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>Memuat laporan analytics...</p>
        </div>
      </div>
    );
  }

  const { summary, charts } = data;

  const formatPrice = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
    return `Rp ${(val / 1_000_000).toFixed(0)} Jt`;
  };

  // Summary metric cards
  const metricCards = [
    {
      label:    "Total Properti",
      value:    `${summary.totalListings} Unit`,
      sub:      `${summary.availableListings} avail · ${summary.bookingListings} booking · ${summary.soldListings} sold`,
      accentBg: "#e5f4e8",
      accent:   "#16a34a",
    },
    {
      label:    "Nilai Portofolio",
      value:    formatPrice(summary.totalPortfolioValue),
      sub:      "Total nilai pasar seluruh listing",
      accentBg: "#eef2ff",
      accent:   "#6366f1",
    },
    {
      label:    "Total Buyer Lead",
      value:    `${summary.totalBuyers} Client`,
      sub:      "Prospek aktif di pipeline CRM",
      accentBg: "#fdf5e4",
      accent:   "#d97706",
    },
    {
      label:    "Unit Tersedia",
      value:    `${summary.availableListings} Unit`,
      sub:      "Siap ditawarkan ke pembeli",
      accentBg: "#ede8fd",
      accent:   "#7c3aed",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
          >
            {/* Colored top stripe */}
            <div className="h-1" style={{ backgroundColor: card.accent }} />
            <div className="p-5">
              <div className="text-[11px] font-medium mb-2" style={{ color: "#9ca3af" }}>
                {card.label}
              </div>
              <div className="text-2xl font-bold" style={{ color: "#111" }}>
                {card.value}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: "#9ca3af" }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pie — Property Type Distribution */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <div>
            <h3 className="font-bold text-[14px]" style={{ color: "#111" }}>Distribusi Jenis Properti</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>Komposisi unit berdasarkan tipe</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.jenisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {charts.jenisData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#ebebeb",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#6b7280" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar — Buyer Pipeline Funnel */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <div>
            <h3 className="font-bold text-[14px]" style={{ color: "#111" }}>Pipeline Buyer CRM</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>Jumlah buyer di setiap tahapan</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.buyerPipelineData} barSize={32}>
                <XAxis
                  dataKey="label"
                  stroke="#d1d5db"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#d1d5db"
                  fontSize={10}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#ebebeb",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "#f9f9f9", radius: 8 }}
                />
                <Bar
                  dataKey="count"
                  fill="#111111"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 text-center text-xs"
        style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb", color: "#9ca3af" }}
      >
        © {new Date().getFullYear()} Mulia Luxury Property CRM · Next.js · Drizzle ORM + Turso · Gemini AI
      </div>
    </div>
  );
}
