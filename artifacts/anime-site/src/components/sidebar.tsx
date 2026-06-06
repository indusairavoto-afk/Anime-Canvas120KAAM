import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Search, Calendar, Users, Bookmark, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Browse", href: "/browse" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Bookmark, label: "My List", href: "/watchlist" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const { ids } = useWatchlist();

  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(href));

  return (
    <>
      {/* ── DESKTOP: floating pill ── */}
      <motion.aside
        animate={{ width: collapsed ? 52 : 160 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex fixed left-3 top-1/2 -translate-y-1/2 z-40 flex-col bg-zinc-900/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden"
        style={{ borderRadius: 26, minWidth: collapsed ? 52 : 160 }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[2px] flex flex-col justify-center pointer-events-none">
          {NAV_ITEMS.map(({ href }, i) => (
            isActive(href) ? (
              <motion.div
                key={href}
                layoutId="active-stripe"
                className="bg-white"
                style={{
                  position: "absolute",
                  top: `${(i / NAV_ITEMS.length) * 100 + (1 / NAV_ITEMS.length) * 100 * 0.2}%`,
                  height: `${(1 / NAV_ITEMS.length) * 100 * 0.6}%`,
                  width: 2,
                  borderRadius: 2,
                }}
              />
            ) : null
          ))}
        </div>

        <nav className="flex flex-col py-3 flex-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = isActive(href);
            const showBadge = href === "/watchlist" && ids.length > 0;
            const showCommunityBadge = href === "/community";
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  className={`relative flex items-center gap-3 cursor-pointer transition-colors mx-1.5 my-0.5 ${active ? "bg-white/[0.08]" : ""}`}
                  style={{ borderRadius: 16, padding: "10px 12px" }}
                  title={collapsed ? label : undefined}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-white/40"}`} strokeWidth={active ? 2 : 1.5} />
                    {showBadge && (
                      <motion.span key={ids.length} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1.5 -right-1.5 bg-white text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {ids.length > 99 ? "99" : ids.length}
                      </motion.span>
                    )}
                    {showCommunityBadge && (
                      <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">54</span>
                    )}
                  </div>
                  <motion.span
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                    transition={{ duration: 0.2 }}
                    className={`text-xs font-mono uppercase tracking-widest whitespace-nowrap overflow-hidden select-none ${active ? "text-white" : "text-white/40"}`}
                  >
                    {label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-white/[0.08]" />
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center py-3 text-white/25 hover:text-white/60 transition-colors">
          <motion.div animate={{ rotate: collapsed ? 90 : -90 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </motion.aside>

      {/* ── MOBILE: bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/[0.08] flex items-stretch">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = isActive(href);
          const showBadge = href === "/watchlist" && ids.length > 0;
          const showCommunityBadge = href === "/community";
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={`relative flex flex-col items-center justify-center gap-1 py-2.5 transition-all ${active ? "text-white" : "text-white/35"}`}>
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                      {ids.length > 9 ? "9+" : ids.length}
                    </span>
                  )}
                  {showCommunityBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">54</span>
                  )}
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest leading-none">{label}</span>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
