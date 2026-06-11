import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft, Search, Grid3X3, List, Play, SkipForward, SkipBack,
  Scissors, Bookmark, BookmarkCheck, ChevronDown, MessageSquare,
  ThumbsUp, ThumbsDown, CornerDownRight, Eye,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchProgress } from "@/hooks/useWatchProgress";

interface StreamEpisode {
  title: string;
  thumbnail: string;
  url: string;
  site: string;
}

interface RelationNode {
  id: number;
  title: { romaji: string; english?: string | null };
  coverImage: { large?: string };
  format?: string | null;
  seasonYear?: number | null;
  relationType: string;
}

interface AniMedia {
  id: number;
  title: { romaji: string; english?: string | null; native?: string | null };
  coverImage: { extraLarge?: string; large?: string };
  bannerImage?: string | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  score?: number | null;
  status: string;
  seasonYear?: number | null;
  startDate?: { year?: number | null; month?: number | null; day?: number | null };
  countryOfOrigin?: string | null;
  format?: string | null;
  studios?: { nodes: { name: string }[] };
  streamingEpisodes: StreamEpisode[];
  relations?: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: { romaji: string; english?: string | null };
        coverImage: { large?: string };
        format?: string | null;
        seasonYear?: number | null;
      };
    }[];
  };
}

const STATUS_MAP: Record<string, string> = {
  FINISHED: "FINISHED",
  RELEASING: "RELEASING",
  NOT_YET_RELEASED: "UPCOMING",
  CANCELLED: "CANCELLED",
  HIATUS: "ON HIATUS",
};

const WATCH_QUERY = `
query ($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { extraLarge large }
    bannerImage
    episodes
    duration
    averageScore
    status
    seasonYear
    startDate { year month day }
    countryOfOrigin
    format
    studios(isMain: true) { nodes { name } }
    streamingEpisodes { title thumbnail url site }
    relations {
      edges {
        relationType
        node {
          id
          title { romaji english }
          coverImage { large }
          format
          seasonYear
        }
      }
    }
  }
}`;

interface Comment {
  id: string;
  author: string;
  text: string;
  ts: number;
  likes: number;
}

function useLocalComments(key: string) {
  const [comments, setComments] = useState<Comment[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
  });
  const save = (next: Comment[]) => {
    setComments(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  return { comments, save };
}

export default function WatchAniList() {
  const params = useParams<{ animeId: string; episode: string }>();
  const animeId = parseInt(params.animeId ?? "0");
  const currentEp = parseInt(params.episode ?? "1");
  const [, navigate] = useLocation();

  const [anime, setAnime] = useState<AniMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"SUB" | "DUB">("SUB");
  const [server, setServer] = useState<"HD-1" | "HD-2">("HD-1");
  const [epSearch, setEpSearch] = useState("");
  const [epGridView, setEpGridView] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState(() => localStorage.getItem("na_username") ?? "");
  const [commentSort, setCommentSort] = useState<"Best" | "Newest" | "Oldest">("Newest");
  const epListRef = useRef<HTMLDivElement>(null);

  const { toggle, isInList } = useWatchlist();
  const { markWatched, isWatched } = useWatchProgress();
  const saved = isInList(animeId);

  const { comments, save: saveComments } = useLocalComments(`na_comments_al_${animeId}`);

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

  useEffect(() => {
    if (epListRef.current) {
      const active = epListRef.current.querySelector("[data-active='true']");
      active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [anime, currentEp]);

  const totalEps = anime?.episodes ?? 0;
  const title = anime?.title.english || anime?.title.romaji || "";
  const native = anime?.title.native ?? "";
  const cover = anime?.coverImage.extraLarge || anime?.coverImage.large || "";
  const banner = anime?.bannerImage || cover;
  const studio = anime?.studios?.nodes[0]?.name ?? "";
  const status = STATUS_MAP[anime?.status ?? ""] ?? anime?.status ?? "";

  const streamEps = anime?.streamingEpisodes ?? [];
  const episodeNumbers = totalEps > 0
    ? Array.from({ length: totalEps }, (_, i) => i + 1)
    : Array.from({ length: Math.max(currentEp + 4, streamEps.length, 12) }, (_, i) => i + 1);

  const filteredEps = episodeNumbers.filter((n) => {
    if (!epSearch.trim()) return true;
    return String(n).includes(epSearch.trim());
  });

  const getEpThumb = (n: number) => {
    const s = streamEps[n - 1];
    return s?.thumbnail || cover;
  };

  const getEpTitle = (n: number) => {
    const s = streamEps[n - 1];
    if (s?.title && s.title !== `Episode ${n}`) return s.title;
    return `Episode ${n}`;
  };

  const relatedAnime: RelationNode[] = (anime?.relations?.edges ?? [])
    .map((e) => ({ ...e.node, relationType: e.relationType }))
    .filter((n) => n.id !== animeId)
    .slice(0, 8);

  const startDateStr = anime?.startDate?.year
    ? [anime.startDate.year, anime.startDate.month, anime.startDate.day]
        .filter(Boolean).join(".")
    : null;

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === "Best") return b.likes - a.likes;
    if (commentSort === "Oldest") return a.ts - b.ts;
    return b.ts - a.ts;
  });

  const submitComment = () => {
    if (!commentText.trim()) return;
    const author = commentAuthor.trim() || "Anonymous";
    localStorage.setItem("na_username", author);
    setCommentAuthor(author);
    saveComments([
      ...comments,
      { id: crypto.randomUUID(), author, text: commentText.trim(), ts: Date.now(), likes: 0 },
    ]);
    setCommentText("");
  };

  const likeComment = (id: string) => {
    saveComments(comments.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 text-[11px] font-mono uppercase tracking-widest text-white/30">
        <Link href="/">
          <span className="hover:text-white transition-colors cursor-pointer">Home</span>
        </Link>
        <span>/</span>
        <Link href={`/anime/al/${animeId}`}>
          <span className="hover:text-white transition-colors cursor-pointer truncate max-w-[200px] inline-block align-bottom">{title}</span>
        </Link>
        <span>/</span>
        <span className="text-white/60">Episode {currentEp}</span>
      </div>

      {/* 3-column main layout */}
      <div className="flex flex-col xl:flex-row gap-0">

        {/* ── LEFT: Anime info panel ── */}
        <div className="hidden xl:flex flex-col w-56 shrink-0 border-r border-white/5 p-4 gap-4">
          <Link href={`/anime/al/${animeId}`}>
            <img
              src={cover}
              alt={title}
              className="w-full aspect-[3/4] object-cover hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <div>
            <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2">{title}</h2>
            {native && <p className="text-[10px] text-white/30 mt-0.5 line-clamp-1">{native}</p>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {totalEps > 0 && (
              <span className="text-[9px] font-mono border border-white/15 px-2 py-0.5 text-white/50 uppercase tracking-widest">
                {totalEps} EPS
              </span>
            )}
            {anime?.averageScore && (
              <span className="text-[9px] font-mono border border-white/15 px-2 py-0.5 text-white/50 uppercase tracking-widest">
                ★ {(anime.averageScore / 10).toFixed(1)}
              </span>
            )}
            {status && (
              <span className={`text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest border ${
                status === "RELEASING" ? "border-green-500/40 text-green-400" : "border-white/15 text-white/50"
              }`}>
                {status}
              </span>
            )}
          </div>
          {(startDateStr || anime?.countryOfOrigin) && (
            <div className="text-[10px] text-white/30 space-y-1 font-mono">
              {startDateStr && <div><span className="text-white/20">Start:</span> {startDateStr}</div>}
              {anime?.countryOfOrigin && <div><span className="text-white/20">Country:</span> {anime.countryOfOrigin}</div>}
              {studio && <div><span className="text-white/20">Studio:</span> {studio}</div>}
            </div>
          )}
        </div>

        {/* ── CENTER: Player + controls ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Player */}
          <div className="w-full aspect-video bg-black">
            <VideoPlayer
              src={undefined as unknown as string}
              poster={banner}
              title={title}
              episodeLabel={`Episode ${currentEp}`}
              onEnded={() => {
                if (totalEps === 0 || currentEp < totalEps) {
                  navigate(`/watch/al/${animeId}/${currentEp + 1}`);
                }
              }}
            />
          </div>

          {/* Warning banner */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/5 text-[10px] text-white/30">
            <MessageSquare className="w-3 h-3 shrink-0" />
            If the episode is not working, please try a different server below.
          </div>

          {/* Player control bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              {currentEp > 1 && (
                <Link href={`/watch/al/${animeId}/${currentEp - 1}`}>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Previous episode">
                    <SkipBack className="w-4 h-4 text-white/50 hover:text-white" />
                  </button>
                </Link>
              )}
              <Link href={`/watch/al/${animeId}/${currentEp}`}>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                  <Play className="w-4 h-4 text-white/50 hover:text-white fill-current" />
                </button>
              </Link>
              {(totalEps === 0 || currentEp < totalEps) && (
                <Link href={`/watch/al/${animeId}/${currentEp + 1}`}>
                  <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Next episode">
                    <SkipForward className="w-4 h-4 text-white/50 hover:text-white" />
                  </button>
                </Link>
              )}
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                <Scissors className="w-4 h-4 text-white/30" />
              </button>
            </div>
            <button
              onClick={() => toggle({ id: animeId, title, coverImage: cover })}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title={saved ? "Remove from watchlist" : "Add to watchlist"}
            >
              {saved
                ? <BookmarkCheck className="w-4 h-4 text-white" />
                : <Bookmark className="w-4 h-4 text-white/40 hover:text-white" />}
            </button>
          </div>

          {/* "You are watching" + SUB/DUB + Quality */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 border-b border-white/5">
            <div>
              <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-0.5">You are watching</p>
              <p className="text-sm font-semibold text-white">
                Episode {currentEp}
                {totalEps > 0 && <span className="text-white/30 font-normal"> / {totalEps}</span>}
              </p>
              <p className="text-[10px] text-white/25 mt-0.5">
                If the current server doesn't work, try another server below.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {/* Language */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mr-1 flex items-center gap-1">
                  <span className="text-[8px] border border-white/20 px-1 py-0.5">SUB</span>
                </span>
                {(["HD-1", "HD-2"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => { setServer(q); setLang("SUB"); }}
                    className={`text-[10px] font-mono px-2.5 py-1 border transition-colors ${
                      lang === "SUB" && server === q
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/40 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mr-1 flex items-center gap-1">
                  <span className="text-[8px] border border-white/20 px-1 py-0.5">DUB</span>
                </span>
                {(["HD-1", "HD-2"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => { setServer(q); setLang("DUB"); }}
                    className={`text-[10px] font-mono px-2.5 py-1 border transition-colors ${
                      lang === "DUB" && server === q
                        ? "border-white bg-white text-black"
                        : "border-white/20 text-white/40 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── BELOW PLAYER: Comments + Related ── */}
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Comments */}
            <div className="flex-1 min-w-0 px-4 sm:px-6 py-6 border-r border-white/5">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="text-base font-semibold text-white uppercase tracking-wide">Comments</h3>
                <span className="text-[10px] font-mono bg-white/10 text-white/60 px-2 py-0.5">{comments.length}</span>
                <div className="ml-auto flex gap-1">
                  {(["Best", "Newest", "Oldest"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setCommentSort(s)}
                      className={`text-[10px] font-mono px-3 py-1 border transition-colors ${
                        commentSort === s
                          ? "border-white bg-white text-black"
                          : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Write comment */}
              <div className="mb-6 space-y-2">
                <input
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                />
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") submitComment(); }}
                  placeholder="Write your comment..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
                />
                <button
                  onClick={submitComment}
                  className="px-5 py-2 bg-white text-black text-xs font-mono uppercase tracking-widest hover:bg-white/90 transition-colors"
                >
                  Post
                </button>
              </div>

              {/* Comment list */}
              <div className="space-y-5">
                {sortedComments.length === 0 && (
                  <p className="text-white/20 text-xs font-mono">No comments yet. Be the first!</p>
                )}
                {sortedComments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-mono text-white/50 uppercase">
                      {c.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">{c.author}</span>
                        <span className="text-[9px] font-mono text-white/25">
                          {new Date(c.ts).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{c.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => likeComment(c.id)}
                          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {c.likes > 0 && <span>{c.likes}</span>}
                        </button>
                        <button className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white transition-colors">
                          <CornerDownRight className="w-3 h-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related anime */}
            {relatedAnime.length > 0 && (
              <div className="lg:w-72 xl:w-80 px-4 py-6 shrink-0">
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-white inline-block" />
                  Related Anime
                </h3>
                <div className="space-y-3">
                  {relatedAnime.map((r) => (
                    <Link key={r.id} href={`/anime/al/${r.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 -mx-2 px-2 py-1.5 transition-colors">
                        <img
                          src={r.coverImage?.large || ""}
                          alt={r.title.english || r.title.romaji}
                          className="w-12 h-16 object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white group-hover:text-white/80 transition-colors line-clamp-2 font-medium">
                            {r.title.english || r.title.romaji}
                          </p>
                          <p className="text-[10px] text-white/30 font-mono mt-0.5 uppercase">
                            {r.relationType.replace(/_/g, " ")}
                            {r.format ? ` · ${r.format}` : ""}
                            {r.seasonYear ? ` · ${r.seasonYear}` : ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Episode list ── */}
        <div className="xl:w-80 shrink-0 border-l border-white/5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Episodes</h3>
              <span className="text-[10px] font-mono text-white/30">{totalEps > 0 ? totalEps : "?"}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEpGridView(false)}
                className={`p-1.5 rounded transition-colors ${!epGridView ? "text-white" : "text-white/30 hover:text-white"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEpGridView(true)}
                className={`p-1.5 rounded transition-colors ${epGridView ? "text-white" : "text-white/30 hover:text-white"}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded text-white/30 hover:text-white transition-colors ml-1">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search episodes */}
          <div className="px-3 py-2.5 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5">
              <Search className="w-3 h-3 text-white/25 shrink-0" />
              <input
                value={epSearch}
                onChange={(e) => setEpSearch(e.target.value)}
                placeholder="Search episodes..."
                className="flex-1 bg-transparent text-xs text-white placeholder-white/25 focus:outline-none"
              />
            </div>
          </div>

          {/* Episodes scroll */}
          <div ref={epListRef} className="overflow-y-auto flex-1 max-h-[600px] xl:max-h-[calc(100vh-200px)]">
            {epGridView ? (
              <div className="grid grid-cols-4 gap-1 p-2">
                {filteredEps.map((ep) => {
                  const active = ep === currentEp;
                  const watched = isWatched(ep);
                  return (
                    <Link key={ep} href={`/watch/al/${animeId}/${ep}`}>
                      <div
                        data-active={active}
                        className={`aspect-square flex items-center justify-center text-xs font-mono cursor-pointer transition-colors border ${
                          active
                            ? "bg-white text-black border-white font-bold"
                            : watched
                            ? "border-white/10 text-white/30 bg-white/5"
                            : "border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {ep}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredEps.map((ep) => {
                  const active = ep === currentEp;
                  const watched = isWatched(ep);
                  const thumb = getEpThumb(ep);
                  const epTitle = getEpTitle(ep);
                  return (
                    <Link key={ep} href={`/watch/al/${animeId}/${ep}`}>
                      <div
                        data-active={active}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                          active ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-12 shrink-0 overflow-hidden bg-zinc-900">
                          <img
                            src={thumb}
                            alt={`EP ${ep}`}
                            className="w-full h-full object-cover"
                          />
                          {active && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                          {watched && !active && (
                            <div className="absolute bottom-0.5 right-0.5">
                              <span className="text-[8px] font-mono bg-white/20 text-white px-1">✓</span>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium line-clamp-2 leading-snug ${active ? "text-white" : watched ? "text-white/40" : "text-white/80"}`}>
                            {ep}. {epTitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
