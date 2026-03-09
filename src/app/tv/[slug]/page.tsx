import { getTvDetails } from "./action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, Play, Users, Film, Tv, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { TrailerDialog } from "@/components/trailer-dialog";
import Link from "next/link";
import { AdBanner } from "@/components/ad-banner";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetadataTags } from "@/lib/mini-ai";
import { EpisodeSelector } from "@/components/episode-selector";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const { slug } = await params;
    const series = await getTvDetails(slug);

    if (!series) return { title: "TV Show Not Found" };

    const tags = generateMetadataTags(series, "tv");
    const previousImages = (await parent).openGraph?.images || [];
    const backdrop = series.backdrop_path ? `https://image.tmdb.org/t/p/w1280${series.backdrop_path}` : "";

    return {
        title: `${series.name} - ZFN TV`,
        description: series.overview?.slice(0, 160) || `Watch ${series.name} full seasons and episodes on ZFN. High quality TV show streaming.`,
        keywords: tags,
        alternates: {
            canonical: `/tv/${slug}`,
        },
        openGraph: {
            title: `${series.name} - ZFN TV`,
            description: series.overview?.slice(0, 200) || `Watch all seasons of ${series.name} on ZFN.`,
            images: [
                {
                    url: backdrop,
                    width: 1280,
                    height: 720,
                    alt: series.name,
                },
                ...previousImages,
            ],
            type: "video.tv_show",
            siteName: "ZFN Cinema",
        },
        twitter: {
            card: "summary_large_image",
            title: `${series.name} - ZFN TV`,
            description: series.overview?.slice(0, 200) || `Watch ${series.name} episodes online.`,
            images: [backdrop],
        },
    };
}

export default async function TvDetailPage({ params, searchParams }: Props) {
    const [{ slug }, { from }] = await Promise.all([params, searchParams]);
    const series = await getTvDetails(slug);
    const backHref = from === "tv" ? "/?type=tv" : "/";

    if (!series) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">TV Show not found</h1>
                    <p className="text-muted-foreground">The TV show you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const title = series.name || series.original_name || "Untitled";
    const year = series.first_air_date?.split("-")[0] || "N/A";
    const status = series.status || "N/A";
    const cast = series.credits?.cast?.slice(0, 10) || [];
    const creator = series.created_by?.[0]?.name || "Unknown";
    const trailer = series.videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube");

    const seasons = series.number_of_seasons || 0;
    const episodes = series.number_of_episodes || 0;

    return (
        <div className="relative min-h-screen">
            <AdBanner />
            {/* Backdrop Section */}
            <div className="absolute inset-0 h-[70vh] w-full">
                <Image src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`} alt={title} fill priority className="object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 py-12 md:py-20 lg:px-8">
                <Link href={backHref} className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    BACK TO EXPLORE
                </Link>
                <div className="flex flex-col gap-12 lg:flex-row">
                    {/* Poster Sidebar */}
                    <div className="w-full shrink-0 lg:w-87.5">
                        <div className="sticky top-24 overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 border border-primary/10 ring-1 ring-white/10">
                            <AspectRatio ratio={2 / 3}>
                                <Image src={`https://image.tmdb.org/t/p/w780${series.poster_path}`} alt={title} fill className="object-cover" />
                            </AspectRatio>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {series.genres?.map((genre: any) => (
                                    <Badge key={genre.id} variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-bold uppercase tracking-wider">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight italic">{title.toUpperCase()}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground italic">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-lg font-bold text-foreground">{series.vote_average?.toFixed(1)}</span>
                                    <span>({series.vote_count?.toLocaleString()} votes)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tv className="h-4 w-4" />
                                    <span>{seasons} Seasons</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Film className="h-4 w-4" />
                                    <span>{episodes} Episodes</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            {trailer && <TrailerDialog trailerKey={trailer.key} title={title} />}
                            <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:scale-105 transition-transform" render={<Link href={`/tv/${slug}/watch?s=1&e=1`} />}>
                                <Play className="mr-2 h-6 w-6 fill-current" /> WATCH EPISODE 1
                            </Button>
                            <EpisodeSelector series={series} slug={slug} />
                        </div>

                        <div className="space-y-4 max-w-3xl">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Film className="text-primary h-6 w-6" /> OVERVIEW
                            </h2>
                            <p className="text-lg leading-relaxed text-muted-foreground italic">"{series.overview}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="text-primary h-6 w-6" /> TOP CAST
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {cast.map((actor: any) => (
                                        <div key={actor.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                            {actor.profile_path ? (
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                                                    <Image src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-sm truncate">{actor.name}</p>
                                                <p className="text-xs text-muted-foreground truncate italic">{actor.character}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold uppercase italic">Series Info</h2>
                                <Card className="bg-muted/20 border-border/50 rounded-3xl overflow-hidden shadow-xl">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic font-medium uppercase text-xs tracking-widest">Creator</span>
                                            <span className="font-bold">{creator}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic font-medium uppercase text-xs tracking-widest">Status</span>
                                            <span className="font-bold text-primary italic uppercase">{status}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic font-medium uppercase text-xs tracking-widest">Network</span>
                                            <span className="font-bold">{series.networks?.[0]?.name || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-muted-foreground italic font-medium uppercase text-xs tracking-widest">Type</span>
                                            <span className="font-bold uppercase italic text-xs tracking-widest">{series.type}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
