/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming json payloads
  app.use(express.json());

  // API Route: Generate SEO Content suggestions using Gemini
  app.post("/api/gemini/seo", async (req, res) => {
    try {
      const { keywords, titleContext, bioContext } = req.body;
      if (!keywords) {
        return res.status(400).json({ error: "Kata kunci (keywords) wajib diisi untuk analisis." });
      }

      if (!apiKey) {
        // Fallback mock SEO suggestion if API key is not present (for smooth developer experience)
        return res.json({
          title: `${titleContext || 'Link Klepon'} - ${keywords.split(',')[0]} Terbaik`,
          description: `Temukan ${keywords} dan detail resmi tentang ${titleContext || 'halaman ini'}. Kunjungi bio link interaktif kami sekarang!`
        });
      }

      const prompt = `Anda adalah ahli optimasi SEO profesional. Buatlah satu buah rekomendasi meta Title (panjang ideal sekitar 50-60 karakter) dan satu buah rekomendasi Meta Description (panjang ideal sekitar 140-160 karakter) yang relevan, ramah penelusuran Google, dan menarik pengunjung berdasarkan parameter berikut:
- Kata kunci utama dari pengguna: "${keywords}"
- Nama halaman saat ini: "${titleContext || 'Link Klepon'}"
- Biografi/Bio saat ini: "${bioContext || ''}"

Respon wajib berupa JSON valid dengan struktur kunci berikut:
{
  "title": "rekomendasi title saja",
  "description": "rekomendasi meta description saja"
}

Pastikan respon hanya mentah berupa JSON yang valid tanpa dibungkus markdown block \`\`\`json atau teks pengantar lainnya agar bisa diparse langsung.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "";
      let result;
      try {
        result = JSON.parse(text.trim());
      } catch (parseError) {
        // Fallback if formatting was not perfect
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Format respon AI tidak valid untuk parser JSON.");
        }
      }

      res.json(result);
    } catch (error: any) {
      console.error("SEO Gemini Error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses rekomendasi SEO menggunakan AI." });
    }
  });

  // API Route: Detect visitor IP Location for Stealth Mode verification
  app.get("/api/stealth/location", async (req, res) => {
    try {
      const forwarded = req.headers["x-forwarded-for"];
      const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
      
      const locationInfo = {
        ip: ip || "127.0.0.1",
        country: "Unknown",
        city: "Unknown"
      };

      // Perform geo IP lookup if it's a public IP
      if (ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city`);
          if (geoRes.ok) {
            const data = await geoRes.json();
            if (data.status === "success") {
              locationInfo.country = data.country || "Unknown";
              locationInfo.city = data.city || "Unknown";
            }
          }
        } catch (err) {
          console.error("Geolocation Fetch Error:", err);
        }
      }

      // Detect location based on accept-language fallback if IP lookup failed or returned local
      if (locationInfo.country === "Unknown") {
        const acceptLang = req.headers["accept-language"] || "";
        if (acceptLang.toLowerCase().includes("id")) {
          locationInfo.country = "Indonesia";
        } else if (acceptLang.toLowerCase().includes("sg")) {
          locationInfo.country = "Singapore";
        } else {
          locationInfo.country = "United States";
        }
      }

      res.json(locationInfo);
    } catch (err: any) {
      console.error("Stealth Location Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-stack] Server up and listening on port ${PORT}`);
  });
}

startServer();
