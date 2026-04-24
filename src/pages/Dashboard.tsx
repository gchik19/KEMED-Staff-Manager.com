import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Users as UsersIcon, School, AlertTriangle, BookOpen } from "lucide-react";

export function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setData);
  }, [token]);

  if (!data) return (
    <div className="flex items-center justify-center h-full p-12">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#004d40] rounded-full animate-spin"></div>
        <p className="font-medium tracking-wide">Loading analytics...</p>
      </div>
    </div>
  );

  const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-800">Analytics Dashboard</h2>
        <p className="text-sm text-slate-500 font-medium">Real-time overview of Krachi East Municipal staff metrics.</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#004d40]/10 flex items-center justify-center shrink-0">
              <UsersIcon className="h-6 w-6 text-[#004d40]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Teachers</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{data.totalTeachers}</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <School className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Schools</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{data.bySchool?.length || 0}</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Registered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subjects Taught</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{data.bySubject?.length || 0}</h3>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Covered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="shadow-sm border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retiring Soon</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800">{data.retiringSoon?.length || 0}</h3>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">≤ 5 Years</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Teachers by Level - Donut Chart */}
        <Card className="col-span-1 shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-slate-50 py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="w-1.5 h-4 bg-[#0ea5e9] rounded-full inline-block"></span>
              Teachers by Level
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-4 pb-2 px-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.byLevel} 
                  dataKey="count" 
                  nameKey="level" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70}
                  outerRadius={100} 
                  paddingAngle={2}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  className="font-bold text-[11px] fill-slate-600" 
                  stroke="none"
                >
                  {data.byLevel.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} Teachers`, "Count"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 600 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution - Bar Chart */}
        <Card className="col-span-1 shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-slate-50 py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="w-1.5 h-4 bg-[#004d40] rounded-full inline-block"></span>
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6 pb-2 px-2 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ageDistribution} margin={{left: -20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dx={-10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 600 }} />
                <Bar dataKey="count" fill="#004d40" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* By School - Vertical Bar Chart for better readability */}
        <Card className="col-span-1 shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-slate-50 py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
              Top Schools by Teacher Count
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-6 pb-2 pl-0 sm:pl-2 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bySchool.slice(0, 8)} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis dataKey="school" type="category" width={110} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 600 }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Subject - Vertical Bar Chart */}
        <Card className="col-span-1 shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-transparent border-b border-slate-50 py-4 px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              Top Subjects Taught
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-6 pb-2 pl-0 sm:pl-2 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bySubject.slice(0, 8)} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis dataKey="subject" type="category" width={110} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 600 }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden mt-2">
        <CardHeader className="bg-white border-b border-slate-100 py-5 px-6">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
             <span className="w-1.5 h-4 bg-rose-500 rounded-full inline-block"></span>
             Nearing Retirement (≤ 5 years)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 tracking-wider font-bold">Full Name</th>
                  <th className="px-6 py-4 tracking-wider font-bold">School Name</th>
                  <th className="px-6 py-4 tracking-wider font-bold text-right">Remaining Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.retiringSoon.map((p: any, i: number) => (
                  <tr key={i} className="bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.full_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.school_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border-rose-200 uppercase tracking-widest shadow-sm">
                          {p.years_to_retirement} {p.years_to_retirement === 1 ? 'Year' : 'Years'}
                       </span>
                    </td>
                  </tr>
                ))}
                {data.retiringSoon.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500 font-medium italic bg-slate-50/30">No staff nearing retirement.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

