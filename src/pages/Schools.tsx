import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";

export function Schools() {
  const { token, user } = useAuth();
  const [schools, setSchools] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") return <div>Access denied</div>;

  const fetchSchools = () => {
    fetch("/api/schools", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setSchools);
  };

  useEffect(() => {
    fetchSchools();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editingId ? `/api/schools/${editingId}` : "/api/schools";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setIsOpen(false);
      setName("");
      setEditingId(null);
      fetchSchools();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to save");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-slate-800">Schools</h2>
           <p className="text-slate-500 font-medium mt-1">Manage schools in the directorate</p>
        </div>
        {user?.role === "SUPER_ADMIN" && (
           <Button className="bg-[#004d40] hover:bg-[#00332a] shadow-sm font-semibold tracking-wide" onClick={() => { setName(""); setEditingId(null); setIsOpen(true); setError(""); }}>
             Add School
           </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Name</th>
                {user?.role === "SUPER_ADMIN" && <th className="px-6 py-4 font-bold tracking-wider w-[200px]">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-600">{s.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                  {user?.role === "SUPER_ADMIN" && (
                     <td className="px-6 py-4 flex items-center gap-2">
                       <Button variant="outline" size="sm" className="shadow-sm font-semibold" onClick={() => {
                           setName(s.name);
                           setEditingId(s.id);
                           setIsOpen(true);
                           setError("");
                       }}>Edit</Button>
                       <Button variant="destructive" size="sm" className="shadow-sm font-semibold" onClick={async () => {
                           if(!confirm("Delete school?")) return;
                           const res = await fetch(`/api/schools/${s.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
                           if (!res.ok) {
                               const err = await res.json();
                               alert(err.error);
                           } else {
                               fetchSchools();
                           }
                       }}>Delete</Button>
                     </td>
                  )}
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">No schools registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit School" : "Add School"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the name of the school." : "Register a new school in the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <div className="text-red-500 bg-red-50 text-sm p-3 rounded-md">{error}</div>}
            <div className="space-y-2">
              <Label>School Name <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. KRACHI SHS" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#004d40] hover:bg-[#00332a]">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
