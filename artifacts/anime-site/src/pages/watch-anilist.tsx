import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Play, List, Bookmark, BookmarkCheck,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchProgress } from "@/hooks/useWatchProgress";

interface AniMedia {
  id: number;
  title: { romaji: string; english?: string | null };
  coverImage: { extraLarge?: string; large?: string };
  bannerImage?: string | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  studios?: { nodes: { name: string }[] };
}

const WATCH_QUERY = `
query ($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { extraLarge large }
    bannerImage
    episodes
    duration
    averageScore
    studios(isMain: true) { nodes { name } }
  }
}`;

export default function WatchAniList() {
  const params = useParams<{ animeId: string; episode: string }>();
  const animeId = parseInt(params.animeId ?? "0");
  const currentEp = parseInt(params.episode ?? "1");
  const [, navigate] = useLocation();

  const [anime, setAnime] = useState<AniMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEpList, setShowEpList] = useState(false);

  const { toggle, isInList } = useWatchlist();
  const { markWatched, isWatched } = useWatchProgress();
  const saved = isInList(animeId);

  useEffect(() => {
    if (!animeId) return;
    setLoading(true);
    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: WATCH_QUERY, variables: { id: animeId } }),
    })
      .then((r) => r.json())
      .then((json) => { if (json?.data?.Media) setAnime(json.data.Media); })
      .finally(() => setLoading(false));
  }, [animeId]);

  useEffect(() => {
    if (anime && currentEp) markWatched(currentEp);
  }, [anime, currentEp, markWatched]);

  const totalEps = anime?.episodes ?? 0;
  const title = anime?.title.english || anime?.title.romaji || "";
  const cover = anime?.coverImage.extraLarge || anime?.coverImage.large || "";
  const banner = anime?.bannerImage || cover;
  const studio = anime?.studios?.nodes[0]?.name ?? "";

  const episodeNumbers = totalEps > 0
    ? Array.from({ length: totalEps }, (_, i) => i + 1)
    : Array.from({ length: Math.max(currentEp, 12) }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Player column */}
          <div className="flex-1 min-w-0">
            {/* Back bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Link href={`/anime/al/${animeId}`}>
                <button className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </Link>
              <span className="text-white/10 text-xs">/</span>
              <span className="text-white/60 text-xs font-mono uppercase tracking-widest truncate">{title}</span>
              <span className="text-white/10 text-xs">/</span>
              <span className="text-white/40 text-xs font-mono uppercase tracking-widest">EP {currentEp}</span>
            </div>

            {/* Video player */}
            <div className="w-full aspect-video bg-zinc-950">
              <VideoPlayer
                src={undefined as unknown as string}
                poster={banner}
                title={title}
                episodeLabel={`Episode ${currentEp}`}
                onEnded={() => {
                  if (totalEps > 0 && currentEp < totalEps) {
                    navigate(`/watch/al/${animeId}/${currentEp + 1}`);
                  }
                }}
              />
            </div>

            {/* Episode info bar */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">{studio}</p>
                <h1 className="font-serif text-lg sm:text-xl text-white truncate">{title}</h1>
                <p className="text-white/40 text-xs font-mono mt-1">
                  Episode {currentEp}{totalEps ? ` of ${totalEps}` : ""}
                  {anime?.duration ? ` · ${anime.duration} min` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggle({ id: animeId, title, coverImage: cover })}
                  className="p-2 border border-white/10 hover:border-white/30 transition-colors"
                  title={saved ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {saved
                    ? <BookmarkCheck className="w-4 h-4 text-white" />
                    : <Bookmark className="w-4 h-4 text-white/50" />}
                </button>
                <button
                  onClick={() => setShowEpList((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/30 transition-colors text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white"
                >
                  <List className="w-3.5 h-3.5" />
                  Episodes
                </button>
              </div>
            </div>

            {/* Prev / Next episode */}
            <div className="px-4 sm:px-6 py-3 flex gap-2">
              {currentEp > 1 && (
                <Link href={`/watch/al/${animeId}/${currentEp - 1}`}>
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/30 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    EP {currentEp - 1}
                  </button>
                </Link>
              )}
              {(totalEps === 0 || currentEp < totalEps) && (
                <Link href={`/watch/al/${animeId}/${currentEp + 1}`}>
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/30 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors ml-auto">
                    EP {currentEp + 1}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Episode sidebar */}
          <motion.div
            className={`lg:w-72 xl:w-80 border-l border-white/5 flex-col ${showEpList ? "flex" : "hidden lg:flex"}`}
            initial={false}
          >
            {/* Anime mini-card */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <img src={cover} alt={title} className="w-10 h-14 object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium line-clamp-2">{title}</p>
                {totalEps > 0 && (
                  <p className="text-white/30 text-[10px] font-mono mt-0.5">{totalEps} episodes</p>
                )}
              </div>
            </div>

            {/* Episode list */}
            <div className="overflow-y-auto flex-1 max-h-[600px]">
              <div className="p-3 border-b border-white/5">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Episodes</p>
              </div>
              <div className="divide-y divide-white/5">
                {episodeNumbers.map((ep) => {
                  const watched = isWatched(ep);
                  const active = ep === currentEp;
                  return (
                    <Link key={ep} href={`/watch/al/${animeId}/${ep}`}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          active
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        {active
                          ? <Play className="w-3 h-3 fill-white shrink-0" />
                          : <span className={`w-3 h-3 shrink-0 flex items-center justify-center text-[9px] font-mono ${watched ? "text-white/30" : ""}`}>
                              {watched ? "✓" : ""}
                            </span>}
                        <span className="text-xs font-mono">EP {ep}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
