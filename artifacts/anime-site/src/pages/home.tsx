import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Play, Star, Clock, ChevronRight, TrendingUp, ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useGetNewReleases } from "@workspace/api-client-react";
import { AnimeCardSkeleton } from "@/components/anime-card";
import { useQuery } from "@tanstack/react-query";
import { getListEpisodesQueryKey } from "@workspace/api-client-react";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type TrendingPeriod = "DAY" | "WEEK" | "MONTH";

interface AniMedia {
  id: number;
  title: { romaji: string; english?: string | null };
  description?: string | null;
  coverImage: { extraLarge?: string; large?: string };
  bannerImage?: string | null;
  genres: string[];
  averageScore?: number | null;
  status: string;
  seasonYear?: number | null;
  format?: string | null;
  episodes?: number | null;
  studios?: { nodes: { name: string }[] };
}

const HERO_QUERY = `{
  Page(perPage: 20) {
    media(
      type: ANIME
      sort: TRENDING_DESC
      status: RELEASING
      format: TV
      isAdult: false
    ) {
      id
      title { romaji english }
      description(asHtml: false)
      coverImage { extraLarge large }
      bannerImage
      genres
      averageScore
      status
      seasonYear
      format
      studios(isMain: true) { nodes { name } }
    }
  }
}`;

const POPULAR_QUERY = `{
  Page(perPage: 20) {
    media(
      type: ANIME
      sort: POPULARITY_DESC
      isAdult: false
    ) {
      id
      title { romaji english }
      coverImage { extraLarge large }
      averageScore
      status
      seasonYear
      format
    }
  }
}`;

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
}

async function fetchAniList(query: string): Promise<AniMedia[]> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json?.data?.Page?.media ?? [];
}

function HeroSlide({ anime }: { anime: AniMedia }) {
  return (
    <motion.div
      key={anime.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="absolute inset-0"
    >
      <img
        src={anime.bannerImage!}
        alt={anime.title.english || anime.title.romaji}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.32) contrast(1.1)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
    </motion.div>
  );
}

function HeroText({ anime, direction }: { anime: AniMedia; direction: number }) {
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const desc = anime.description ? stripHtml(anime.description) : "";
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={anime.id}
        custom={direction}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl"
      >
        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4">
          {score && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-yellow-400">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{score}
            </span>
          )}
          {anime.format && (
            <span className="text-[10px] font-mono bg-white/15 text-white/80 px-1.5 py-0.5 uppercase tracking-wider">
              {anime.format}
            </span>
          )}
          {anime.seasonYear && (
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider">{anime.seasonYear}</span>
          )}
          <span className="text-[9px] font-mono bg-white text-black px-2 py-0.5 uppercase tracking-wider font-bold">Trending</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl leading-tight sm:leading-[0.95] text-white mb-2 sm:mb-3 line-clamp-2">
          {title}
        </h1>
        <p className="text-white/55 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 line-clamp-2 max-w-sm sm:max-w-md">
          {desc.slice(0, 200)}
        </p>
        <div className="flex gap-2 sm:gap-3">
          <Link href={`/anime/al/${anime.id}`}>
            <button className="flex items-center gap-1.5 sm:gap-2 bg-white text-black px-4 sm:px-7 py-2 sm:py-3 text-[11px] sm:text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" /> Details
            </button>
          </Link>
          {anime.genres.slice(0, 2).map((g) => (
            <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`}>
              <button className="hidden sm:flex items-center gap-1.5 border border-white/25 text-white px-4 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-sm font-medium uppercase tracking-widest hover:bg-white/5 transition-colors">
                {g}
              </button>
            </Link>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PopularCard({ anime, index }: { anime: AniMedia; index: number }) {
  const cover = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/anime/al/${anime.id}`}>
        <div className="group relative cursor-pointer">
          <div className="relative w-full aspect-[2/3] border border-white/5 bg-zinc-950 overflow-hidden">
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {anime.format && (
                <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-sm text-white text-[8px] font-mono uppercase tracking-widest border border-white/10">
                  {anime.format}
                </span>
              )}
              {score && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-mono">
                  <Star className="w-2.5 h-2.5 fill-white/60 text-white/60" />{score}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 p-3 w-full">
              <h3 className="text-white font-serif text-sm leading-tight line-clamp-2 mb-1">{title}</h3>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/50 uppercase tracking-widest">
                {anime.seasonYear && <span>{anime.seasonYear}</span>}
                {anime.seasonYear && <span className="w-0.5 h-0.5 rounded-full bg-white/30" />}
                <span className={anime.status === "RELEASING" ? "text-white/70" : ""}>{anime.status === "RELEASING" ? "Ongoing" : anime.status === "FINISHED" ? "Completed" : anime.status}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [period, setPeriod] = useState<TrendingPeriod>("DAY");
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const [heroAnime, setHeroAnime] = useState<AniMedia[]>([]);
  const [popularAnime, setPopularAnime] = useState<AniMedia[]>([]);
  const [aniLoading, setAniLoading] = useState(true);

  const { data: newReleases, isLoading: newLoading } = useGetNewReleases();

  useEffect(() => {
    setAniLoading(true);
    Promise.all([fetchAniList(HERO_QUERY), fetchAniList(POPULAR_QUERY)]).then(([hero, popular]) => {
      setHeroAnime(hero.filter((m) => m.bannerImage));
      setPopularAnime(popular);
      setAniLoading(false);
    });
  }, []);

  const slides = heroAnime.slice(0, 8);

  const goTo = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > slide ? 1 : -1));
    setSlide(index);
  }, [slide]);

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setSlide((s) => (s + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(-1);
    setSlide((s) => (s - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length === 0) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const currentAnime = slides[slide];
  // We still use DB episodes for the "Latest Episodes" section
  const { data: slideEpisodes } = useQuery({
    queryKey: getListEpisodesQueryKey(0),
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });
  void slideEpisodes;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero carousel */}
      {aniLoading ? (
        <div className="w-full h-[520px] sm:aspect-[1105/443] sm:h-auto bg-zinc-950 animate-pulse" />
      ) : slides.length > 0 ? (
        <section
          className="relative w-full h-[520px] sm:h-auto sm:aspect-[1105/443] overflow-hidden touch-pan-y"
          data-testid="section-featured"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="sync">
            <HeroSlide key={slides[slide].id} anime={slides[slide]} />
          </AnimatePresence>

          <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-2">
            <button onClick={prev} className="w-11 h-11 flex items-center justify-center border border-white/20 bg-black/50 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="w-11 h-11 flex items-center justify-center border border-white/20 bg-black/50 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all" aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative z-10 h-full flex items-end pb-14 sm:pb-12 px-5 sm:px-14">
            {currentAnime && <HeroText anime={currentAnime} direction={direction} />}
          </div>

          <div className="absolute top-4 right-14 sm:right-20 z-20 text-[10px] font-mono text-white/40 tracking-widest hidden sm:block">
            {String(slide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          <div className="absolute bottom-4 left-5 sm:left-0 sm:right-0 z-20 flex items-center sm:justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative h-1 transition-all duration-300 focus:outline-none"
                style={{ width: i === slide ? 28 : 8 }}
              >
                <span className={`absolute inset-0 transition-all duration-300 ${i === slide ? "bg-white" : "bg-white/30 hover:bg-white/55"}`} />
                {i === slide && (
                  <motion.span
                    className="absolute inset-0 bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5, ease: "linear" }}
                    key={`progress-${slide}`}
                  />
                )}
              </button>
            ))}
            <span className="sm:hidden ml-auto text-[10px] font-mono text-white/40 tracking-widest pr-2">
              {String(slide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>
        </section>
      ) : null}

      <div className="flex gap-0 items-start">
        <div className="flex-1 min-w-0">
          {/* Latest Episodes from DB */}
          <section className="px-4 sm:px-6 py-6 sm:py-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 text-white/30" />
                <h2 className="font-serif text-xl sm:text-2xl text-white">Latest Episodes</h2>
              </div>
              <div className="flex gap-1 sm:gap-2 text-xs font-mono uppercase tracking-widest text-white/40">
                <button className="px-2 sm:px-3 py-1 bg-white text-black text-[10px]">All</button>
                <button className="px-2 sm:px-3 py-1 hover:text-white transition-colors text-[10px]">Sub</button>
                <button className="px-2 sm:px-3 py-1 hover:text-white transition-colors text-[10px]">Dub</button>
              </div>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {newLoading
                ? Array.from({ length: 8 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                : (Array.isArray(newReleases) ? newReleases : []).slice(0, 8).map((ep) => (
                    <motion.div key={ep.id} variants={fadeUp}>
                      <Link href={`/watch/${ep.id}`}>
                        <div className="group cursor-pointer border border-white/5 hover:border-white/20 transition-all overflow-hidden" data-testid={`ep-card-${ep.id}`}>
                          <div className="relative aspect-video overflow-hidden">
                            <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div className="absolute bottom-1 right-1">
                              <span className="text-[8px] font-mono bg-black/80 text-white/60 px-1.5 py-0.5 uppercase">{ep.type}</span>
                            </div>
                            {ep.rating && (
                              <div className="absolute top-1 left-1">
                                <span className="flex items-center gap-0.5 text-[8px] font-mono bg-black/80 text-white/70 px-1.5 py-0.5">
                                  <Star className="w-2 h-2" />{ep.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2 sm:p-2.5">
                            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest truncate mb-0.5">{ep.animeTitle}</p>
                            <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{ep.title}</p>
                            <p className="text-white/30 text-[9px] font-mono mt-1">EP {ep.episodeNumber}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </motion.div>
          </section>

          {/* Popular from AniList */}
          <section className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-4 h-4 text-white/30" />
                <h2 className="font-serif text-xl sm:text-2xl text-white">Most Popular</h2>
              </div>
              <Link href="/browse">
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                  Browse all <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {aniLoading
                ? Array.from({ length: 10 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                : popularAnime.slice(0, 10).map((anime, i) => (
                    <PopularCard key={anime.id} anime={anime} index={i} />
                  ))}
            </motion.div>
          </section>
        </div>

        {/* Sidebar — trending from AniList */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-72 flex-shrink-0 border-l border-white/5 bg-zinc-950/40 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-serif text-lg text-white">Top Trending</h3>
            <div className="flex gap-1">
              {(["DAY", "WEEK", "MONTH"] as TrendingPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-[9px] font-mono uppercase tracking-widest px-1.5 sm:px-2 py-1 transition-colors ${period === p ? "bg-white text-black" : "text-white/30 hover:text-white"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-2 sm:p-3 space-y-0.5">
            {aniLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/[0.03] animate-pulse border border-white/5" />
                ))
              : heroAnime.slice(0, 10).map((anime, i) => {
                  const cover = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
                  const title = anime.title.english || anime.title.romaji;
                  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
                  return (
                    <Link key={anime.id} href={`/anime/al/${anime.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex items-center gap-3 p-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/10"
                      >
                        <span className="text-white/15 font-serif text-xl w-6 flex-shrink-0 text-right leading-none">{i + 1}</span>
                        <img src={cover} alt={title} className="w-9 h-12 object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium line-clamp-2 leading-snug group-hover:text-white transition-colors">{title}</p>
                          {score && (
                            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-white/30">
                              <Star className="w-2.5 h-2.5" />{score}
                              {anime.format && <span className="border border-white/10 px-1">{anime.format}</span>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
          </div>
        </aside>
      </div>
    </div>
  );
}
