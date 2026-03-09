import { Suspense } from "react";
import SearchClient from "./search-client";

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="p-4 md:p-8 space-y-8 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-9 w-64 bg-muted rounded-md" />
                        <div className="h-4 w-48 bg-muted rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[300px] bg-muted rounded-xl" />
                        ))}
                    </div>
                </div>
            }
        >
            <SearchClient />
        </Suspense>
    );
}
