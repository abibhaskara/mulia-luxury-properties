import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Cosine similarity between two float vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate fallback embedding vector (768 dimensions) deterministically from text
function generateDeterministicFallbackEmbedding(textStr: string): number[] {
  const dim = 768;
  const embedding = new Array(dim).fill(0);
  const normalizedText = textStr.toLowerCase();
  
  // Hash text tokens into fixed vector spaces
  const words = normalizedText.split(/\s+/);
  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index1 = Math.abs(hash) % dim;
    const index2 = Math.abs(hash * 31 + idx) % dim;
    const val = (hash % 1000) / 1000;
    embedding[index1] += val;
    embedding[index2] += 1 - Math.abs(val);
  });

  // L2 normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    return embedding.map(val => val / norm);
  }
  return embedding;
}

// Main function to generate text-embedding-004 using Gemini API
export async function getEmbedding(textInput: string): Promise<number[]> {
  if (!textInput || textInput.trim().length === 0) {
    return new Array(768).fill(0);
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(textInput);
      if (result.embedding?.values) {
        return result.embedding.values;
      }
    } catch (error) {
      console.warn("Gemini embedding error, falling back to deterministic vector:", error);
    }
  }


  return generateDeterministicFallbackEmbedding(textInput);
}

// AI Match explanation generator
export async function generateMatchPitch(buyerInfo: any, listingInfo: any, scorePct: number): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a top real estate AI assistant for Mulia Luxury Property Agency.
Analyze this property listing match for buyer "${buyerInfo.nama_klien}":
- Buyer Requirements: Type=${buyerInfo.jenis_dicari || "Any"}, Location=${buyerInfo.lokasi_dicari || "Any"}, Budget=Rp ${(buyerInfo.budget_min || 0).toLocaleString()} - Rp ${(buyerInfo.budget_max || 0).toLocaleString()}, Min Bedrooms=${buyerInfo.kt_min || 0}. Notes: ${buyerInfo.catatan || "None"}
- Property Listing: Code=${listingInfo.kode}, Type=${listingInfo.jenis}, Location=${listingInfo.lokasi_area}, Price=Rp ${(listingInfo.harga || 0).toLocaleString()}, Bedrooms=${listingInfo.kamar_tidur}, Furnished=${listingInfo.furnished}. Details: ${listingInfo.catatan || "None"}
- Vector Match Score: ${scorePct}%

Write a compelling, professional 2-3 sentence recommendation pitch in Indonesian explaining why this property is a strong match for this buyer. Keep it persuasive, precise, and polite.`;
      
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) return text.trim();
    } catch (err) {
      console.warn("Gemini pitch generation fallback:", err);
    }
  }

  // Fallback template match pitch
  return `Properti ${listingInfo.kode} di ${listingInfo.lokasi_area} sangat cocok untuk ${buyerInfo.nama_klien} dengan tingkat kesesuaian ${scorePct}%. Properti ini memiliki spesifikasi ${listingInfo.kamar_tidur} KT, tipe ${listingInfo.jenis}, dan berada dalam kisaran harga yang kompetitif.`;
}
