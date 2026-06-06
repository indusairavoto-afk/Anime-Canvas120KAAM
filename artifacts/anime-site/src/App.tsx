import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

import Home from "@/pages/home";
import Browse from "@/pages/browse";
import AnimeDetail from "@/pages/anime-detail";
import AnimeDetailAniList from "@/pages/anime-detail-anilist";
import CharacterDetail from "@/pages/character-detail";
import Watch from "@/pages/watch";
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
