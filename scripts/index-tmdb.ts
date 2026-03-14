import { PrismaClient } from "../src/generated/prisma";
import "dotenv/config";

const prisma = new PrismaClient();
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const HEADERS = {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
};

const DELAY_MS = 1000 / 30; // ~30 requests per second to stay under 40/s limit

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFromTMDB(url: string) {
    let retries = 3;
    while (retries > 0) {
        const response = await fetch(url, { headers: HEADERS });
        if (response.status === 429) {
            console.warn(` Rate limited (429). Waiting for 5 seconds...`);
            await sleep(5000);
            retries--;
            continue;
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.json();
    }
    throw new Error(`Failed to fetch ${url} after retries`);
}

async function indexTMDB(mediaType: "movie" | "tv") {
    let countAdded = 0;
    let countSkipped = 0;
    let totalPages = 1;
    const MAX_TMDB_PAGES = 500; // TMDB consistently limits list pagination to 500 pages

    for (let page = 1; page <= totalPages && page <= MAX_TMDB_PAGES; page++) {
        console.log(`[${mediaType.toUpperCase()}] Fetching page ${page}...`);

        // Using trending as an example for indexing
        const url = `https://api.themoviedb.org/3/trending/${mediaType}/day?language=en-US&page=${page}`;

        try {
            const data = await fetchFromTMDB(url);

            // Set total pages based on TMDB response
            if (page === 1 && data.total_pages) {
                totalPages = data.total_pages;
                console.log(`[${mediaType.toUpperCase()}] Discovered ${totalPages} total pages (capping at ${MAX_TMDB_PAGES}).`);
            }

            const items = data.results || [];

            for (const item of items) {
                // Prepare data to match Prisma schema
                const tmdbId = item.id;
                const category = "trending"; // Defaulting to trending category for index setup

                // Skip check
                const existing = await prisma.movie.findUnique({
                    where: {
                        id_category: {
                            id: tmdbId,
                            category: category,
                        },
                    },
                });

                if (existing) {
                    countSkipped++;
                    process.stdout.write(`\rSkipped: ${countSkipped} | Added: ${countAdded} | Scanning ${item.name || item.title}...`.substring(0, 80));
                    continue;
                }

                // Insert to DB
                await prisma.movie.create({
                    data: {
                        id: tmdbId,
                        title: item.title || item.name || "",
                        original_title: item.original_title || item.original_name || "",
                        overview: item.overview || "",
                        backdrop_path: item.backdrop_path,
                        poster_path: item.poster_path,
                        media_type: mediaType,
                        original_language: item.original_language || "en",
                        release_date: item.release_date || item.first_air_date || null,
                        popularity: item.popularity || 0,
                        vote_average: item.vote_average || 0,
                        vote_count: item.vote_count || 0,
                        adult: item.adult || false,
                        video: item.video || false,
                        category: category,
                    },
                });

                countAdded++;
                process.stdout.write(`\rSkipped: ${countSkipped} | Added: ${countAdded} | Adding ${item.name || item.title}...`.substring(0, 80));

                // Respect rate limit intentionally
                await sleep(DELAY_MS);
            }
            console.log(`\n[${mediaType.toUpperCase()}] Finished page ${page}`);
        } catch (error) {
            console.error(`\nError fetching page ${page}:`, error);
        }
    }

    console.log(`\nIndexing completed for ${mediaType}. Skipped: ${countSkipped}, Added: ${countAdded}\n`);
}

async function main() {
    if (!TMDB_ACCESS_TOKEN) {
        console.error("TMDB_ACCESS_TOKEN is not defined in .env");
        process.exit(1);
    }

    console.log("Starting TMDB Indexing...\n");

    // Index movies
    await indexTMDB("movie");

    // Index tv shows
    await indexTMDB("tv");

    console.log("All indexing done.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
