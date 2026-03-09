/**
 * Simple "Mini AI" logic to generate SEO tags/keywords from movie/TV metadata.
 * This is a deterministic generator that mimics AI extraction.
 */
export function generateMetadataTags(media: any, type: "movie" | "tv"): string[] {
    const tags = new Set<string>();

    // 1. Add Title & Original Title
    const title = media.title || media.name || "";
    const originalTitle = media.original_title || media.original_name || "";
    if (title) tags.add(title.toLowerCase());
    if (originalTitle) tags.add(originalTitle.toLowerCase());

    // 2. Add Genres
    if (media.genres) {
        media.genres.forEach((g: any) => tags.add(g.name.toLowerCase()));
    }

    // 3. Extract entities and keywords from overview (simulating AI extraction)
    const overview = media.overview || "";
    const cleanOverview = overview.toLowerCase().replace(/[^\w\s]/g, "");
    const words = cleanOverview.split(/\s+/);

    // Stop words to filter out (common filler words)
    const stopWords = new Set(["the", "and", "a", "an", "is", "in", "it", "to", "for", "of", "with", "this", "that", "on", "at", "by", "from", "as", "he", "she", "his", "her", "they", "was", "will", "be"]);

    // Extract significant words (nouns/themes) from the description
    const thematicKeywords = words.filter((word: string) => word.length > 4 && !stopWords.has(word));

    // Limit thematic keywords to the most relevant/first few
    thematicKeywords.slice(0, 8).forEach((keyword: string) => tags.add(keyword));

    // Preset thematic checks (high-value SEO tags)
    const themes = ["action", "romance", "adventure", "battle", "journey", "secrets", "family", "hero", "war", "mystery", "death", "future", "magic", "fantasy", "crime", "thriller", "horror"];

    themes.forEach((theme) => {
        if (cleanOverview.includes(theme)) {
            tags.add(theme);
        }
    });

    // 4. Add Year
    const date = media.release_date || media.first_air_date || "";
    if (date) {
        const year = date.split("-")[0];
        tags.add(year);
        tags.add(`${title} ${year}`);
    }

    // 5. Add common SEO suffixes
    tags.add(`watch ${title} online`);
    tags.add(`stream ${title} free`);
    tags.add(`${title} ${type === "movie" ? "movie" : "tv series"}`);

    return Array.from(tags);
}
