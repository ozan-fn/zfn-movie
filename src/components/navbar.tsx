"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Maximize2, Minimize2, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

import { useRouter } from "next/navigation";

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <div className="flex items-center space-x-2 shrink-0">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="relative h-10 w-10 overflow-hidden">
                            <Image src={logo} alt="ZFN Movie Logo" fill className="object-contain" priority />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-primary italic uppercase sm:block hidden">
                            ZFN <span className="text-foreground not-italic">Movie</span>
                        </span>
                    </Link>
                </div>

                <div className="flex-1 max-w-xl px-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search your favorite movie..." className="w-full pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-full h-10 cursor-pointer" onFocus={() => router.push("/search")} onClick={() => router.push("/search")} readOnly />
                    </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="rounded-full hidden sm:flex">
                        {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
