"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        setQuery(searchParams.get("q") || "");
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const clearSearch = () => {
        setQuery("");
        router.push("/search");
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-8">
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input type="text" placeholder="Search for movies..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-12 pr-12 h-14 text-lg rounded-2xl border-2 border-muted bg-background/50 backdrop-blur-sm focus-visible:ring-primary focus-visible:border-primary transition-all shadow-lg shadow-black/5" />
                {query && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearSearch} className="absolute inset-y-0 right-2 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    );
}
