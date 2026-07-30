import { useState } from "react";
import { LayoutDashboard, Cpu, History, Settings, LogOut, Menu, X, ChevronRight, Grid, Brain, ExternalLink, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar({ activeTab, setActiveTab, isAdmin }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "AI & Vitals", icon: Brain },
    { id: "devices", label: "Devices", icon: Cpu },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        {!isCollapsed && <span className="font-semibold text-lg tracking-tight text-zinc-100">EchoGaze</span>}
      </div>

      <nav className="flex-1 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative",
              activeTab === item.id
                ? "text-zinc-100 bg-zinc-800 shadow-sm"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-colors duration-300", activeTab === item.id ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
            {!isCollapsed && <span className={cn("font-medium tracking-wide text-sm", activeTab === item.id && "font-semibold")}>{item.label}</span>}
          </button>
        ))}

        {/* Direct Patient Grid Link */}
        <Link
          href="/patient"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-300 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-medium mt-6 group text-sm"
        >
          <Grid className="w-5 h-5 shrink-0 transition-transform duration-300 text-zinc-400 group-hover:text-zinc-300" />
          {!isCollapsed && <span className="flex-1 text-left flex items-center justify-between">Patient Grid <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" /></span>}
        </Link>
        
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-300 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-medium mt-3 group text-sm"
          >
            <ShieldAlert className="w-5 h-5 shrink-0 transition-transform duration-300 text-zinc-400 group-hover:text-zinc-300" />
            {!isCollapsed && <span className="flex-1 text-left">Admin Panel</span>}
          </Link>
        )}
      </nav>

      <div className="pt-6 border-t border-zinc-800 mt-6 relative z-10">
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 group text-sm",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-colors" />
          {!isCollapsed && <span className="font-medium tracking-wide">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-echogaze-surface border border-echogaze-surface-hover text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 px-4 py-8 overflow-hidden",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="relative z-10 flex flex-col h-full">
          {sidebarContent}
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-12 w-7 h-7 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors z-50 shadow-sm"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", !isCollapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  );
}
