import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";

type SitemapExtension = {
    url: string;
    lastModified?: string | Date;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
    images?: string[];
    videos?: {
        title: string;
        thumbnail_loc: string;
        description: string;
        content_loc?: string;
        player_loc?: string;
        duration?: number;
        view_count?: number;
        publication_date?: string;
        family_friendly?: "yes" | "no";
    }[];
};

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const cacheData = await prisma.detailCache.findMany({
        select: {
            id: true,
            updatedAt: true,
            data: true,
        },
    });

    const entries: any[] = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];

    cacheData.forEach((item) => {
        try {
            const detail = JSON.parse(item.data);
            const type = item.id.startsWith("movie_") ? "movie" : "tv";
            const title = detail.title || detail.name;
            if (!title) return;

            const slugBase = title
                .toLowerCase()
                .replace(/[^a-z0-0\s-]/g, "")
                .replace(/\s+/g, "-");
            const slug = `${slugBase}-${detail.id}`;
            const image = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : `https://image.tmdb.org/t/p/w500${detail.poster_path}`;

            // Validasi format tanggal YYYY-MM-DD
            const rawDate = detail.release_date || detail.first_air_date || item.updatedAt.toISOString();
            const publicationDate = new Date(rawDate).toISOString().split("T")[0];

            // Entry Detail dengan Image Sitemap
            entries.push({
                url: `${SITE_URL}/${type}/${slug}`,
                lastModified: new Date(item.updatedAt),
                changeFrequency: "weekly",
                priority: 0.8,
                images: [image],
            });

            // Entry Watch tanpa video tag yang bermasalah (player_loc == loc)
            // Google melarang player_loc sama dengan URL halaman itu sendiri
            entries.push({
                url: `${SITE_URL}/${type}/${slug}/watch`,
                lastModified: new Date(item.updatedAt),
                changeFrequency: "weekly",
                priority: 0.7,
            });
        } catch (e) {
            // Skip
        }
    });

    return entries;
}
