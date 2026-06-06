import { Link, useLocation } from "wouter";
import { Search, Bell, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useListAnime, getListAnimeQueryKey } from "@workspace/api-client-react";
import type { Anime } from "@workspace/api-client-react";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  const { data: results } = useListAnime(
    query.length >= 2 ? { search: query } : undefined,
    { query: { enabled: query.length >= 2, queryKey: getListAnimeQueryKey(query.length >= 2 ? { search: query } : undefined) } }
  );

  const visibleResults = results?.slice(0, 6) ?? [];

  // Reset active index when results change
  useEffect(() => { setActiveIndex(-1); }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (mobileSearch) setTimeout(() => mobileInputRef.current?.focus(), 100);
  }, [mobileSearch]);

  // Global ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setMobileSearch(true);
        } else {
          inputRef.current?.focus();
          setOpen(query.length >= 2);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  const handleSelect = useCallback((anime: Anime) => {
    setQuery("");
    setOpen(false);
    setMobileSearch(false);
    setActiveIndex(-1);
    navigate(`/anime/${anime.id}`);
  }, [navigate]);

  const handleViewAll = useCallback(() => {
    if (!query.trim()) return;
    setOpen(false);
    setMobileSearch(false);
    setActiveIndex(-1);
    navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
  }, [query, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || visibleResults.length === 0) {
      if (e.key === "Escape") { setQuery(""); setOpen(false); }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i < visibleResults.length - 1 ? i + 1 : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i > -1 ? i - 1 : visibleResults.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && visibleResults[activeIndex]) {
          handleSelect(visibleResults[activeIndex]);
        } else {
          handleViewAll();
        }
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
        break;
    }
  }, [open, visibleResults, activeIndex, handleSelect, handleViewAll]);

  const Dropdown = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`absolute ${mobile ? "top-full left-0 right-0" : "top-full left-0 right-0 mt-1"} bg-zinc-950 border border-white/10 shadow-2xl z-50 overflow-hidden`}>
      <ul className="max-h-72 overflow-y-auto">
        {visibleResults.map((anime, i) => (
          <li key={anime.id}>
            <button
              onClick={() => handleSelect(anime)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${i === activeIndex ? "bg-white/10" : "hover:bg-white/5"} ${mobile ? "border-b border-white/5" : ""}`}
            >
              <img src={anime.coverImage} alt={anime.title} className="w-8 h-10 object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{anime.title}</p>
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">{anime.releaseYear} · {anime.studio}</p>
              </div>
              {i === activeIndex && <ArrowRight className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
      {query.trim() && (
        <button
          onClick={handleViewAll}
          className="w-full flex items-center justify-between px-4 py-2.5 border-t border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest"
        >
          <span>View all results for "{query.trim()}"</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );

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
            ref={inputRef}
            type="search"
            placeholder="Search anime..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none min-w-0"
            data-testid="topbar-search"
            autoComplete="off"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="text-[9px] font-mono text-white/20 border border-white/10 px-1 py-0.5">⌘</kbd>
            <kbd className="text-[9px] font-mono text-white/20 border border-white/10 px-1 py-0.5">K</kbd>
          </div>
        </div>
        {open && visibleResults.length > 0 && <Dropdown />}
      </div>

      {/* Mobile: expanded search overlay */}
      {mobileSearch && (
        <div className="sm:hidden absolute inset-x-0 top-0 h-14 bg-black/95 flex items-center px-3 z-10">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.06] border border-white/15 px-3 py-2.5">
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              ref={mobileInputRef}
              type="search"
              placeholder="Search anime..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
              autoComplete="off"
            />
          </div>
          <button onClick={() => { setMobileSearch(false); setQuery(""); setOpen(false); setActiveIndex(-1); }} className="ml-3 text-white/50 p-1">
            <X className="w-5 h-5" />
          </button>
          {open && visibleResults.length > 0 && (
            <div className="absolute top-14 left-0 right-0 max-h-[60vh] overflow-y-auto">
              <Dropdown mobile />
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
