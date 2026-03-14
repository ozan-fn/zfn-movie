import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";

export async function GET() {
    // 1. Ambil data dari database
    const movies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            overview: true,
            media_type: true,
            backdrop_path: true,
            poster_path: true,
            updatedAt: true,
        },
    });

    // 2. Buat kerangka awal XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // 3. Masukkan halaman statis
    xml += `
        <url>
            <loc>${SITE_URL}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>${SITE_URL}/?type=movies</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>${SITE_URL}/?type=tv</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    `;

    // 4. Looping untuk halaman dinamis (film)
    movies.forEach((movie) => {
        if (!movie.title) return;

        const type = movie.media_type || "movie";
        const slugBase = movie.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const slug = `${slugBase}-${movie.id}`;

        const image = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

        xml += `
            <url>
                <loc>${SITE_URL}/${type}/${slug}</loc>
                <lastmod>${movie.updatedAt.toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.7</priority>`;

        // Tambahkan tag image khusus jika ada gambar
        if (image) {
            xml += `<image:image><image:loc>${image}</image:loc></image:image>`;
        }

        xml += `</url>`;
    });

    // 5. Tutup tag XML
    xml += `</urlset>`;

    // 6. Return menggunakan NextResponse dengan header text/xml
    return new NextResponse(xml, {
        status: 200,
        headers: {
            "Content-Type": "text/xml",
            // Opsional: Tambahkan cache control agar Vercel tidak hit database terus
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
        },
    });
}
