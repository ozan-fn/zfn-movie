import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";
const ITEMS_PER_PAGE = 20;

export async function GET() {
    try {
        // 1. Hitung total film di database
        const totalMovies = await prisma.movie.count();

        // 2. Hitung berapa banyak pecahan sitemap yang dibutuhkan
        const totalSitemaps = Math.ceil(totalMovies / ITEMS_PER_PAGE);

        // Jaga-jaga jika database kosong, minimal tetap render sitemap/0.xml
        const maxLoops = totalSitemaps > 0 ? totalSitemaps : 1;

        // 3. Bangun kerangka XML untuk Sitemap Index
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // 4. Looping untuk mencetak link anak-anak sitemap
        for (let i = 0; i < maxLoops; i++) {
            xml += `  <sitemap>\n`;
            xml += `    <loc>${SITE_URL}/sitemap/${i}.xml</loc>\n`;
            xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
            xml += `  </sitemap>\n`;
        }

        xml += `</sitemapindex>`;

        // 5. Kembalikan respons berupa XML
        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "text/xml",
                // Beri tahu Vercel untuk menyimpan cache ini selama 1 hari (86400 detik)
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Gagal membuat Sitemap Index:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
