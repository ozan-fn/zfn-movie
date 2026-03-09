import * as movieApi from "./action";
import { MovieSection } from "@/components/movie-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from "lucide-react";
import { AdBanner } from "@/components/ad-banner";
import type { Metadata } from "next";

const SITE_URL = "https://zfn-movie.vercel.app";

export const metadata: Metadata = {
    title: "ZFN - Explore Movies and TV Shows",
    description: "Discover the latest movies and TV shows on ZFN. Trending today, popular picks, and high-rated classics. High-speed streaming with multi-server support.",
    applicationName: "ZFN Cinema",
    authors: [{ name: "ZFN Team" }],
    keywords: ["movies", "tv shows", "streaming", "ZFN", "cinema", "entertainment", "watch movies free", "frieren", "anime streaming"],
    creator: "ZFN Cinema",
    publisher: "ZFN Cinema",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    openGraph: {
        title: "ZFN - Explore Movies and TV Shows",
        description: "Discover the latest movies and TV shows on ZFN. Trending today, popular picks, and high-rated classics.",
        url: SITE_URL,
        siteName: "ZFN Cinema",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "ZFN Cinema Logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "ZFN - Explore Movies and TV Shows",
        description: "Discover the latest movies and TV shows on ZFN. Trending today, popular picks, and high-rated classics.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type } = await searchParams;
    const activeTab = type === "tv" ? "tv" : "movies";

    // Fetch Movies
    const [trendingToday, trendingWeek, popular, nowPlaying, upcoming, topRated] = await Promise.all([movieApi.getTrendingToday(), movieApi.getTrendingWeek(), movieApi.getTrendingWeek(), movieApi.getPopularMovies(), movieApi.getNowPlayingMovies(), movieApi.getUpcomingMovies(), movieApi.getTopRatedMovies()]);

    // Fetch TV Shows
    const [trendingTodayTV, trendingWeekTV, popularTV, airingTodayTV, onTheAirTV, topRatedTV] = await Promise.all([movieApi.getTrendingTodayTV(), movieApi.getTrendingWeekTV(), movieApi.getPopularTV(), movieApi.getAiringTodayTV(), movieApi.getOnTheAirTV(), movieApi.getTopRatedTV()]);

    return (
        <main className="container mx-auto py-10 px-4 space-y-12 max-w-7xl">
            <AdBanner />
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase underline decoration-primary decoration-8 underline-offset-8">
                    EXPLORE <span className="text-primary italic">ZFN</span>
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-2xl italic">"Your ultimate destination for cinematic discovery and television excellence."</p>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-12">
                <div className="sticky top-20 z-30 py-4 bg-background/80 backdrop-blur-md -mx-4 px-4 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 shadow-sm w-fit flex flex-row">
                        <TabsTrigger
                            value="movies"
                            className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 gap-2 font-black italic"
                            render={
                                <a href="/?type=movies">
                                    <Film className="h-4 w-4" /> MOVIES
                                </a>
                            }
                        />
                        <TabsTrigger
                            value="tv"
                            className="rounded-xl px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 gap-2 font-black italic"
                            render={
                                <a href="/?type=tv">
                                    <Tv className="h-4 w-4" /> TV SHOWS
                                </a>
                            }
                        />
                    </TabsList>
                </div>

                <TabsContent value="movies" className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 m-0 outline-none">
                    <MovieSection title="Trending Today" movies={trendingToday} />
                    <MovieSection title="Trending This Week" movies={trendingWeek} />
                    <MovieSection title="Popular Movies" movies={popular} />
                    <MovieSection title="Now Playing" movies={nowPlaying} />
                    <MovieSection title="Upcoming" movies={upcoming} />
                    <MovieSection title="Top Rated" movies={topRated} />
                </TabsContent>

                <TabsContent value="tv" className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 m-0 outline-none">
                    <MovieSection title="TV - Trending Today" movies={trendingTodayTV} />
                    <MovieSection title="TV - Trending This Week" movies={trendingWeekTV} />
                    <MovieSection title="Popular TV Shows" movies={popularTV} />
                    <MovieSection title="Airing Today" movies={airingTodayTV} />
                    <MovieSection title="On The Air" movies={onTheAirTV} />
                    <MovieSection title="Top Rated TV" movies={topRatedTV} />
                </TabsContent>
            </Tabs>
        </main>
    );
}
