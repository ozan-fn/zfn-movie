import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";

export const dynamic = "force-dynamic";

export async function GET() {
    const cacheData = await prisma.detailCache.findMany({
        select: {
            id: true,
            updatedAt: true,
            data: true,
        },
    });

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>`;

    cacheData.forEach((item) => {
        try {
            const detail = JSON.parse(item.data);
            const type = item.id.startsWith("movie_") ? "movie" : "tv";
            const title = detail.title || detail.name;
            if (!title) return;

            const slugBase = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
            const slug = `${slugBase}-${detail.id}`;

            sitemap += `
    <url>
        <loc>${SITE_URL}/${type}/${slug}</loc>
        <lastmod>${item.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/${type}/${slug}/watch</loc>
        <lastmod>${item.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        } catch (e) {}
    });

    sitemap += `\n</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
