import { Link, useLocation } from "wouter";
import { Search, Bell, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useListAnime, getListAnimeQueryKey } from "@workspace/api-client-react";
import type { Anime } from "@workspace/api-client-react";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  const { data: results } = useListAnime(
    query.length >= 2 ? { search: query } : undefined,
    { query: { enabled: query.length >= 2, queryKey: getListAnimeQueryKey(query.length >= 2 ? { search: query } : undefined) } }
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileSearch) setTimeout(() => inputRef.current?.focus(), 100);
  }, [mobileSearch]);

  const handleSelect = (anime: Anime) => {
    setQuery("");
    setOpen(false);
    setMobileSearch(false);
    navigate(`/anime/${anime.id}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/95 backdrop-blur-sm border-b border-white/5 flex items-center px-3 sm:px-4 gap-3">
      <Link href="/" className="flex-shrink-0 flex items-center">
        <span className="font-serif text-xl tracking-tight text-white uppercase leading-none">
          N<span className="text-white/40">A</span>
        </span>
      </Link>

      {/* Desktop search */}
      <div ref={ref} className="hidden sm:flex flex-1 max-w-lg relative">
        <div className="flex items-center gap-3 w-full bg-white/[0.04] border border-white/10 px-4 py-2 focus-within:border-white/30 transition-colors">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="search"
            placeholder="Search anime..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none min-w-0"
            data-testid="topbar-search"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="text-[9px] font-mono text-white/20 border border-white/10 px-1 py-0.5">⌘</kbd>
            <kbd className="text-[9px] font-mono text-white/20 border border-white/10 px-1 py-0.5">S</kbd>
          </div>
        </div>
        {open && results && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-white/10 shadow-2xl z-50 max-h-72 overflow-y-auto">
            {results.slice(0, 6).map((anime) => (
              <button key={anime.id} onClick={() => handleSelect(anime)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                <img src={anime.coverImage} alt={anime.title} className="w-8 h-10 object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{anime.title}</p>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">{anime.releaseYear} · {anime.studio}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: expanded search overlay */}
      {mobileSearch && (
        <div className="sm:hidden absolute inset-0 bg-black/95 flex items-center px-3 z-10">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.06] border border-white/15 px-3 py-2.5">
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search anime..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <button onClick={() => { setMobileSearch(false); setQuery(""); setOpen(false); }} className="ml-3 text-white/50 p-1">
            <X className="w-5 h-5" />
          </button>
          {open && results && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-zinc-950 border-b border-white/10 shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
              {results.slice(0, 6).map((anime) => (
                <button key={anime.id} onClick={() => handleSelect(anime)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5">
                  <img src={anime.coverImage} alt={anime.title} className="w-8 h-10 object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{anime.title}</p>
                    <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">{anime.releaseYear} · {anime.studio}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => setMobileSearch(true)} className="sm:hidden w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=noir" alt="Profile" className="w-full h-full grayscale" />
        </div>
      </div>
    </header>
  );
}
