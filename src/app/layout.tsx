import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mulia Luxury Property — CRM & AI Buyer Matching",
  description:
    "Sistem CRM Properti Serverless Modern untuk Mulia Luxury Property. Manajemen katalog rumah, villa, ruko, tanah, serta AI Vector Matching buyer lead.",
  keywords: ["Mulia Luxury Property", "Property CRM", "Real Estate CRM", "Gemini AI Property Match", "Next.js"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
        />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
