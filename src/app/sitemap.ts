import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";
const ITEMS_PER_PAGE = 20;

export async function generateSitemaps() {
    const totalMovies = await prisma.movie.count();
    const totalSitemaps = Math.ceil(totalMovies / ITEMS_PER_PAGE);

    const sitemaps = [];
    for (let i = 0; i < totalSitemaps; i++) {
        sitemaps.push({ id: i });
    }

    if (sitemaps.length === 0) {
        sitemaps.push({ id: 0 });
    }

    return sitemaps;
}

// 1. Ubah parameter id menjadi opsional dan deteksi tipenya
export default async function sitemap({ id }: { id?: number | string } = {}): Promise<MetadataRoute.Sitemap> {
    // 2. Paksa id menjadi angka (Integer). Jika undefined/error, jadikan 0
    const parsedId = parseInt(String(id), 10);
    const pageIndex = isNaN(parsedId) ? 0 : parsedId;

    // 3. Hitung angka skip yang sudah pasti aman untuk Prisma
    const skipCount = pageIndex * ITEMS_PER_PAGE;

    const entries: MetadataRoute.Sitemap = [];

    // Masukkan URL Statis hanya di sitemap index 0
    if (pageIndex === 0) {
        entries.push({ url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 }, { url: `${SITE_URL}/?type=movies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 }, { url: `${SITE_URL}/?type=tv`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }

    // Ambil data film
    const movies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            media_type: true,
            backdrop_path: true,
            poster_path: true,
            updatedAt: true,
        },
        // 4. Masukkan skipCount yang sudah divalidasi
        skip: skipCount,
        take: ITEMS_PER_PAGE,
        orderBy: { id: "asc" },
    });

    movies.forEach((movie) => {
        try {
            const type = movie.media_type || "movie";
            const title = movie.title;
            if (!title) return;

            const slugBase = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            const slug = `${slugBase}-${movie.id}`;
            const image = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined;

            entries.push({
                url: `${SITE_URL}/${type}/${slug}`,
                lastModified: movie.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
                ...(image && { images: [image] }),
            });
        } catch (e) {
            // Skip
        }
    });

    return entries;
}
