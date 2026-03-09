import { getMovieDetails } from "../action";
import { getMoviePlayers } from "@/lib/players";
import { VideoPlayer } from "@/components/video-player";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdBanner } from "@/components/ad-banner";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetadataTags } from "@/lib/mini-ai";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
    const { slug } = await params;
    const movie = await getMovieDetails(slug);
    if (!movie) return { title: "Watching Movie" };

    const tags = generateMetadataTags(movie, "movie");
    const previousImages = (await parent).openGraph?.images || [];
    const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : "";

    return {
        title: `WATCHING: ${movie.title} - ZFN`,
        description: `Streaming ${movie.title} on ZFN. Select your preferred server for high speed streaming. Full movie watch online.`,
        keywords: [...tags, "watch online", movie.title, "movie streaming", "ZFN"],
        alternates: {
            canonical: `/movie/${slug}/watch`,
        },
        openGraph: {
            title: `WATCHING: ${movie.title} - ZFN Cinema`,
            description: `Now streaming ${movie.title} in HD. Multi-server playback options available.`,
            images: [
                {
                    url: backdrop,
                    width: 1280,
                    height: 720,
                    alt: `Watch ${movie.title}`,
                },
                ...previousImages,
            ],
            type: "video.other",
            siteName: "ZFN Cinema",
        },
        twitter: {
            card: "summary_large_image",
            title: `WATCHING: ${movie.title} - ZFN Cinema`,
            description: `Watch ${movie.title} high speed streaming.`,
            images: [backdrop],
        },
    };
}

export default async function MovieWatchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Extract ID from slug
    const id = slug.split("-").pop();
    if (!id || isNaN(Number(id))) return <div>Invalid Movie ID</div>;

    const movie = await getMovieDetails(slug);
    if (!movie) return <div>Movie not found</div>;

    const players = getMoviePlayers(id);

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 h-full w-full">
                <Image src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.title} fill className="object-cover opacity-10 blur-xl" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 py-12 md:py-20 max-w-7xl">
                <Link href={`/movie/${slug}`} className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    BACK TO DETAILS
                </Link>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                            WATCHING <span className="text-primary italic">— {movie.title.toUpperCase()}</span>
                        </h1>
                        <p className="text-muted-foreground font-medium italic">{movie.overview.slice(0, 200)}...</p>
                    </div>

                    <VideoPlayer players={players} title={movie.title} />
                </div>
            </div>
        </div>
    );
}
