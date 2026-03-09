"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Play, ChevronDown, ListVideo, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Season {
    id: number;
    season_number: number;
    episode_count: number;
    name: string;
    air_date?: string;
}

interface EpisodeSelectorProps {
    series: {
        seasons: Season[];
        status?: string;
        last_episode_to_air?: {
            season_number: number;
            episode_number: number;
        };
    };
    slug: string;
    currentSeason?: number;
    currentEpisode?: number;
    mode?: "detail" | "watch";
}

export function EpisodeSelector({ series, slug, currentSeason = 1, currentEpisode = 1, mode = "detail" }: EpisodeSelectorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const seasons = series?.seasons || [];
    const lastAired = series?.last_episode_to_air;

    // Filter out Specials (Season 0) and sort seasons to ensure proper order
    const sortedSeasons = [...seasons].filter((s) => s.season_number > 0).sort((a, b) => a.season_number - b.season_number);

    const [selectedSeason, setSelectedSeason] = useState(() => {
        return sortedSeasons.find((s) => s.season_number === currentSeason) || sortedSeasons[0];
    });

    if (!sortedSeasons.length || !selectedSeason) return null;

    const episodes = Array.from({ length: selectedSeason.episode_count }, (_, i) => i + 1);

    const isEpisodeReleased = (seasonNum: number, episodeNum: number) => {
        if (!lastAired) return true; // Fallback if data is missing

        if (seasonNum < lastAired.season_number) return true;
        if (seasonNum > lastAired.season_number) return false;
        return episodeNum <= lastAired.episode_number;
    };

    const handleEpisodeClick = (seasonNum: number, episodeNum: number) => {
        if (mode === "watch") {
            startTransition(() => {
                router.push(`/tv/${slug}/watch?s=${seasonNum}&e=${episodeNum}`);
            });
        }
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <ListVideo className="text-primary h-6 w-6" />
                    {mode === "watch" ? "Navigate Episodes" : "Select Episode"}
                </h2>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-muted/50 border border-border/50 font-bold italic uppercase text-sm hover:bg-muted transition-all">
                        {selectedSeason.name} <ChevronDown className="h-4 w-4 text-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-2xl p-2 min-w-[200px]">
                        {seasons.map((season) => (
                            <DropdownMenuItem key={season.id} onClick={() => setSelectedSeason(season)} className={cn("rounded-xl px-4 py-2 text-sm font-bold italic uppercase cursor-pointer transition-all", selectedSeason.season_number === season.season_number ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                                {season.name} ({season.episode_count} eps)
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {episodes.map((ep) => {
                    const isActive = selectedSeason.season_number === currentSeason && ep === currentEpisode;
                    const released = isEpisodeReleased(selectedSeason.season_number, ep);
                    const href = `/tv/${slug}/watch?s=${selectedSeason.season_number}&e=${ep}`;

                    if (!released) {
                        return (
                            <div key={ep} className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border border-border/20 bg-muted/10 opacity-40 cursor-not-allowed">
                                <span className="text-2xl font-black italic tracking-tighter text-muted-foreground">{ep < 10 ? `0${ep}` : ep}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest italic mt-1 text-muted-foreground">COMING</span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={ep}
                            href={href}
                            onClick={(e) => {
                                if (mode === "watch") {
                                    e.preventDefault();
                                    handleEpisodeClick(selectedSeason.season_number, ep);
                                }
                            }}
                            className={cn("group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 overflow-hidden", isActive ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-105" : "bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50 hover:-translate-y-1", isPending && "opacity-50 cursor-wait pointer-events-none")}
                        >
                            <span className={cn("text-2xl font-black italic tracking-tighter transition-colors", isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary")}>{ep < 10 ? `0${ep}` : ep}</span>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest italic mt-1 opacity-60", isActive ? "text-primary-foreground" : "text-muted-foreground")}>EPISODE</span>
                            {isActive && <div className="absolute top-1 right-1">{isPending ? <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" /> : <Play className="h-3 w-3 fill-current text-primary-foreground" />}</div>}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
