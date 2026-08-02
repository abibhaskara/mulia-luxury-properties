import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harsalab Studio — Property CRM & Buyer Matching Web App",
  description:
    "System CRM Properti serverless modern untuk Harsalab Studio. Manajemen katalog rumah, villa, ruko, tanah, serta AI Vector Matching buyer lead.",
  keywords: ["Property CRM", "Harsalab Studio", "Real Estate CRM", "Gemini AI Property Match", "Next.js 14", "Drizzle ORM"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
        />
      </head>
      <body className="antialiased bg-white text-black">
        {children}
      </body>
    </html>
  );
}
