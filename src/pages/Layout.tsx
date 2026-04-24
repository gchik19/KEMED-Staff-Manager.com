import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Users as UsersIcon, UsersRound, LogOut, Menu, X, Landmark } from "lucide-react";
import { cn } from "../lib/utils";

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Staff Records", href: "/staff", icon: UsersIcon, roles: ["SUPER_ADMIN", "ADMIN", "HEAD_TEACHER"] },
    { name: "User Management", href: "/users", icon: UsersRound, roles: ["SUPER_ADMIN"] },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#f4f6f9]">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#004d40] text-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#00332a] bg-[#003d33]">
          <div className="flex items-center gap-3">
             <div className="p-1 rounded-lg">
               <img src="/logo.png" alt="GES Logo" className="h-10 w-auto object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             </div>
             <div>
               <h1 className="text-xl font-bold leading-tight text-yellow-400 drop-shadow-sm tracking-wide">KEMED</h1>
               <p className="text-[10px] text-white/90 font-bold tracking-widest uppercase">Staff Manager</p>
             </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-5 py-6 text-sm bg-gradient-to-b from-[#003d33]/50 to-transparent">
           <p className="text-white/60 mb-1 text-xs font-semibold uppercase tracking-wider">Logged in as:</p>
           <p className="font-semibold text-lg">{user?.name}</p>
           <p className="text-white/80 text-xs mb-2">{user?.staff_id}</p>
           <span className="inline-block px-2 py-1 bg-[#00332a] border border-[#00221c] text-yellow-400 text-xs font-bold rounded shadow-sm">
              {user?.role.replace("_", " ")}
           </span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto w-full">
          {navigation
            .filter((item) => item.roles.includes(user?.role || ""))
            .map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const bgClass = isActive 
                 ? "bg-white/10 text-yellow-400 font-bold border-l-4 border-yellow-400 shadow-sm" 
                 : "text-white/80 hover:bg-white/5 hover:text-white border-l-4 border-transparent";
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn("group flex items-center px-4 py-3.5 text-sm transition-all duration-200 rounded-r-lg w-full", bgClass)}
                >
                  <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-yellow-400" : "text-white/50 group-hover:text-white/80")} />
                  {item.name}
                </Link>
              );
            })}
        </nav>
        
        <div className="p-4 border-t border-[#00332a] bg-[#003d33]/50">
          <button 
            onClick={() => { closeSidebar(); logout(); }}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b z-10 sticky top-0">
           <div className="flex items-center justify-between px-4 py-3 lg:px-8 h-16">
              <div className="flex items-center gap-4 lg:hidden">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="font-bold tracking-wide text-[#004d40]">KEMED</div>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Krachi East Municipal Education Directorate</h2>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
