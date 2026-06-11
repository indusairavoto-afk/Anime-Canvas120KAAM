import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Component, type ErrorInfo, type ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-serif text-3xl">Something went wrong</h1>
            <p className="text-white/50 text-sm">{(this.state.error as Error).message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 border border-white/20 text-sm hover:bg-white/10 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import Home from "@/pages/home";
import Browse from "@/pages/browse";
import AnimeDetail from "@/pages/anime-detail";
import AnimeDetailAniList from "@/pages/anime-detail-anilist";
import CharacterDetail from "@/pages/character-detail";
import Watch from "@/pages/watch";
import WatchAniList from "@/pages/watch-anilist";
import Community from "@/pages/community";
import CommunityPostDetail from "@/pages/community-post-detail";
import Schedule from "@/pages/schedule";
import Watchlist from "@/pages/watchlist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <div className="min-h-[100dvh] bg-black text-white selection:bg-white selection:text-black">
      <Topbar />
      <Sidebar />
      <main className="pt-14 md:pl-[72px] pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/anime/al/:id" component={AnimeDetailAniList} />
          <Route path="/character/:id" component={CharacterDetail} />
          <Route path="/anime/:id" component={AnimeDetail} />
          <Route path="/watch/al/:animeId/:episode" component={WatchAniList} />
          <Route path="/watch/:episodeId" component={Watch} />
          <Route path="/community" component={Community} />
          <Route path="/community/:id" component={CommunityPostDetail} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/watchlist" component={Watchlist} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
