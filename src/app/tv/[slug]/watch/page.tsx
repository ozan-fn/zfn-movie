import { getTvDetails } from "../action";
import { getTvShowPlayers } from "@/lib/players";
import { VideoPlayer } from "@/components/video-player";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata, ResolvingMetadata } from "next";
import { EpisodeSelector } from "@/components/episode-selector";
import { generateMetadataTags } from "@/lib/mini-ai";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ s?: string; e?: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
    const { slug } = await params;
    const { s, e } = await searchParams;
    const series = await getTvDetails(slug);
    if (!series) return { title: "Watching TV Show" };

    const tags = generateMetadataTags(series, "tv");
    const previousImages = (await parent).openGraph?.images || [];
    const backdrop = series.backdrop_path ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}` : "";
    const season = s || 1;
    const episode = e || 1;

    return {
        title: `WATCHING: ${series.name} S${season} E${episode} - ZFN`,
        description: `Streaming ${series.name} Season ${season} Episode ${episode} on ZFN TV. High speed playback with multi-server options.`,
        keywords: [...tags, series.name, "watch free", "ZFN", `Season ${season}`, `Episode ${episode}`],
        alternates: {
            canonical: `/tv/${slug}/watch?s=${season}&e=${episode}`,
        },
        openGraph: {
            title: `WATCHING: ${series.name} S${season} E${episode} - ZFN`,
            description: `Now streaming ${series.name} S${season} E${episode}. Explore all episodes and seasons.`,
            images: [
                {
                    url: backdrop,
                    width: 1280,
                    height: 720,
                    alt: `Watch ${series.name} S${season} E${episode}`,
                },
                ...previousImages,
            ],
            type: "video.episode",
            siteName: "ZFN Cinema",
        },
        twitter: {
            card: "summary_large_image",
            title: `WATCHING: ${series.name} S${season} E${episode} - ZFN`,
            images: [backdrop],
        },
    };
}

export default async function TvWatchPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ s?: string; e?: string }> }) {
    const { slug } = await params;
    const { s, e } = await searchParams;

    // Default to season 1, episode 1 if not specified
    const seasonNum = s ? parseInt(s) : 1;
    const episodeNum = e ? parseInt(e) : 1;

    // Extract ID from slug
    const id = slug.split("-").pop();
    if (!id || isNaN(Number(id))) return <div>Invalid TV ID</div>;

    const series = await getTvDetails(slug);
    if (!series) return <div>TV Show not found</div>;

    const idNum = series.id?.toString() || id;
    const players = getTvShowPlayers(idNum, seasonNum, episodeNum);

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 h-full w-full">
                <Image src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`} alt={series.name} fill className="object-cover opacity-10 blur-xl" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 py-12 md:py-20 max-w-7xl">
                <Link href={`/tv/${slug}`} className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    BACK TO DETAILS
                </Link>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                                    WATCHING <span className="text-primary italic">— {series.name.toUpperCase()}</span>
                                </h1>
                                <div className="flex items-center gap-4 text-primary font-bold italic uppercase tracking-widest text-lg md:text-xl">
                                    <span>SEASON {seasonNum}</span>
                                    <span className="text-muted-foreground">—</span>
                                    <span>EPISODE {episodeNum}</span>
                                </div>
                            </div>
                            <EpisodeSelector series={series} slug={slug} currentSeason={seasonNum} currentEpisode={episodeNum} mode="watch" />
                        </div>
                        <p className="text-muted-foreground font-medium italic">{series.overview?.slice(0, 200)}...</p>
                    </div>

                    <VideoPlayer players={players} title={`${series.name} S${seasonNum} E${episodeNum}`} />

                    {/* Simple Episodes Selector info - since we don't have season/episode picker yet */}
                </div>
            </div>
        </div>
    );
}
