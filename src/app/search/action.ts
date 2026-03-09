"use server";

import axios from "axios";
import prisma from "@/lib/prisma";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const SEARCH_CACHE_TTL = 60 * 60 * 1000; // 1 Jam

// Helper function untuk membuat slug
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}

export async function searchMovies(query: string, page: number = 1, type: "movie" | "tv" = "movie") {
    if (!query || query.trim() === "") {
        return { results: [], nextPage: null, totalResults: 0 };
    }

    const cacheId = `${type}_${query.toLowerCase().trim()}_${page}`;

    try {
        // 1. Cek Cache di Database
        const cachedSearch = await prisma.searchCache.findUnique({
            where: { id: cacheId },
        });

        const isCacheValid = cachedSearch && Date.now() - new Date(cachedSearch.updatedAt).getTime() < SEARCH_CACHE_TTL;

        if (isCacheValid) {
            // Parse kembali string JSON menjadi Object
            return JSON.parse(cachedSearch.data);
        }

        // 2. Jika tidak ada cache atau expired, fetch dari TMDB
        const endpoint = type === "movie" ? "search/movie" : "search/tv";
        const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                Accept: "application/json",
            },
            params: {
                query: query,
                page: page,
                include_adult: false,
                language: "en-US",
            },
        });

        const data = response.data;

        // 3. Format hasil dengan menambahkan slug
        const formattedResults = data.results.map((m: any) => ({
            ...m,
            // TV shows use 'name' instead of 'title'
            slug: `${createSlug(m.title || m.name)}-${m.id}`,
            media_type: type, // Ensure media_type is present
        }));

        const finalData = {
            results: formattedResults,
            nextPage: data.page < data.total_pages ? data.page + 1 : null,
            totalResults: data.total_results,
        };

        // 4. Simpan ke Database sebagai Cache (Upsert: Update jika ada, Create jika belum)
        await prisma.searchCache.upsert({
            where: { id: cacheId },
            update: {
                data: JSON.stringify(finalData),
            },
            create: {
                id: cacheId,
                data: JSON.stringify(finalData),
            },
        });

        return finalData;
    } catch (error) {
        console.error(`Error searching ${type} with query "${query}":`, error);

        // Jika API gagal tapi kita punya cache yang basi (expired), gunakan saja cache itu daripada error
        const fallbackCache = await prisma.searchCache.findUnique({ where: { id: cacheId } });
        if (fallbackCache) {
            return JSON.parse(fallbackCache.data);
        }

        return { results: [], nextPage: null, totalResults: 0 };
    }
}
