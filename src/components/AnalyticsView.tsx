"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-16 text-center text-black font-bold">
        Memuat Laporan Analytics CRM...
      </div>
    );
  }

  const { summary, charts } = data;

  const formatPrice = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(1)} M`;
    }
    return `Rp ${(val / 1000000).toFixed(0)} Jt`;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-black p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black">
            <span>Total Unit Properti</span>
          </div>
          <div className="text-2xl font-bold text-black">{summary.totalListings} Unit</div>
          <div className="text-[11px] text-black">
            {summary.availableListings} Available • {summary.bookingListings} Booking • {summary.soldListings} Sold
          </div>
        </div>

        <div className="bg-white border border-black p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black">
            <span>Nilai Portofolio Properti</span>
          </div>
          <div className="text-2xl font-bold text-black">
            {formatPrice(summary.totalPortfolioValue)}
          </div>
          <div className="text-[11px] text-black">Total nilai pasar seluruh listing</div>
        </div>

        <div className="bg-white border border-black p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black">
            <span>Total Client / Buyers</span>
          </div>
          <div className="text-2xl font-bold text-black">{summary.totalBuyers} Client</div>
          <div className="text-[11px] text-black">Prospek aktif di pipeline CRM</div>
        </div>

        <div className="bg-white border border-black p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black">
            <span>Unit Available (Siap Jual)</span>
          </div>
          <div className="text-2xl font-bold text-black">{summary.availableListings} Unit</div>
          <div className="text-[11px] text-black">Siap ditawarkan ke pembeli</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Property Types Distribution */}
        <div className="bg-white border border-black p-5 space-y-4">
          <h3 className="font-bold text-black text-sm">
            Distribusi Jenis Properti
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.jenisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {charts.jenisData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000" }} itemStyle={{color: "#000"}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Buyer Pipeline Stages */}
        <div className="bg-white border border-black p-5 space-y-4">
          <h3 className="font-bold text-black text-sm">
            Tahapan Pipeline Buyer CRM (Funnel)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.buyerPipelineData}>
                <XAxis dataKey="label" stroke="#000000" fontSize={10} />
                <YAxis stroke="#000000" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000" }} itemStyle={{color: "#000"}} cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#000000" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
