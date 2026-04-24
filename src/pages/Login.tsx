import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Landmark, Lock, User } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: staffId, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#004d40] skew-y-[-4deg] transform origin-top-left z-0 shadow-lg" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-gradient-to-br from-[#004d40] to-[#00332a] pt-10 pb-8 px-6 text-center text-white flex flex-col items-center">
           <div className="px-2 py-1 mb-4 flex items-center justify-center">
             <img src="/logo.png" alt="GES Logo" className="h-20 w-auto object-contain mix-blend-multiply drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
           </div>
           <h1 className="text-3xl font-black tracking-wider text-yellow-400 drop-shadow-md shadow-black/50">KEMED</h1>
           <p className="text-xs font-bold text-white mt-2 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full shadow-inner">
             Staff Manager
           </p>
        </div>
        
        <div className="p-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1 text-center mb-6">
               <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
               <p className="text-sm text-slate-500">Sign in to your administrative account</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md font-medium shadow-sm flex items-center">
                <div className="flex-1">{error}</div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2 relative group">
                <Label htmlFor="staffId" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Staff ID</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#004d40]">
                    <User className="h-5 w-5 transition-colors" />
                  </div>
                  <Input
                    id="staffId"
                    placeholder="e.g. ADMIN-001"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                    className="pl-10 py-6 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 relative group">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#004d40]">
                    <Lock className="h-5 w-5 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 py-6 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full py-6 text-base font-bold tracking-wide bg-[#004d40] hover:bg-[#00332a] text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.99] rounded-xl mt-2" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-6 left-0 w-full text-center text-slate-500 text-xs font-medium z-10 px-4">
        &copy; {new Date().getFullYear()} Krachi East Municipal Education Directorate.
      </div>
    </div>
  );
}
