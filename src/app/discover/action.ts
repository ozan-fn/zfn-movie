"use server";

import axios from "axios";
import prisma from "@/lib/prisma";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const CACHE_TTL = 60 * 60 * 1000; // 1 Jam dalam milidetik

// Tambahkan parameter opsional seperti sortBy jika kamu ingin mengembangkan fiturnya nanti
export async function getDiscoverMovies(page: number = 1, type: "movie" | "tv" = "movie") {
    const category = `discover-${type}-page-${page}`;
    try {
        // 1. Cek data di DB berdasarkan kategori (page spesifik)
        const cachedResults = await prisma.movie.findMany({
            where: { category },
        });

        // 2. Cek apakah cache masih valid (di bawah 1 jam)
        const now = new Date();
        const isCacheValid = cachedResults.length > 0 && now.getTime() - new Date(cachedResults[0].updatedAt).getTime() < CACHE_TTL;

        if (isCacheValid) {
            // Karena discover butuh format spesifik (results + nextPage)
            return {
                results: cachedResults,
                nextPage: page < 500 ? page + 1 : null, // TMDB biasanya limit 500 page
            };
        }

        const response = await axios.get(`${TMDB_BASE_URL}/discover/${type}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                Accept: "application/json",
            },
            params: {
                include_adult: false,
                include_video: false,
                language: "en-US",
                page: page, // Parameter utama untuk infinite scroll
                sort_by: "popularity.desc", // Urutan default
            },
        });

        const data = response.data;

        // 3. Update Database (Upsert)
        const movies = data.results;
        const savedMovies = await Promise.all(
            movies.map((m: any) =>
                prisma.movie.upsert({
                    where: {
                        id_category: {
                            id: m.id,
                            category: category,
                        },
                    },
                    update: {
                        title: m.title || m.name || "Untitled",
                        original_title: m.original_title || m.original_name || "",
                        overview: m.overview || "",
                        poster_path: m.poster_path || "",
                        backdrop_path: m.backdrop_path || "",
                        media_type: m.media_type || type,
                        original_language: m.original_language || "en",
                        release_date: m.release_date || m.first_air_date || "",
                        popularity: m.popularity || 0,
                        vote_average: m.vote_average || 0,
                        vote_count: m.vote_count || 0,
                        adult: m.adult || false,
                        video: m.video || false,
                        updatedAt: new Date(),
                    },
                    create: {
                        id: m.id,
                        category: category,
                        title: m.title || m.name || "Untitled",
                        original_title: m.original_title || m.original_name || "",
                        overview: m.overview || "",
                        poster_path: m.poster_path || "",
                        backdrop_path: m.backdrop_path || "",
                        media_type: m.media_type || type,
                        original_language: m.original_language || "en",
                        release_date: m.release_date || m.first_air_date || "",
                        popularity: m.popularity || 0,
                        vote_average: m.vote_average || 0,
                        vote_count: m.vote_count || 0,
                        adult: m.adult || false,
                        video: m.video || false,
                    },
                }),
            ),
        );

        return {
            results: savedMovies.map((m) => ({
                ...m,
                slug: `${m.title
                    .toLowerCase()
                    .replace(/[^\w ]+/g, "")
                    .replace(/ +/g, "-")}-${m.id}`,
            })),
            nextPage: data.page < data.total_pages ? data.page + 1 : null,
        };
    } catch (error) {
        console.error(`Error fetching discover movies on page ${page}:`, error);
        return {
            results: [],
            nextPage: null,
        };
    }
}
