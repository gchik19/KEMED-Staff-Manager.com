import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

export function StaffList() {
  const { token, user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/staff", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setStaff);
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/staff/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleExportCSV = async () => {
    if (staff.length === 0) {
      alert("No data available to export.");
      return;
    }
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(staff);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "staff_records.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed:", err);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const handleExportExcel = async () => {
    if (staff.length === 0) {
      alert("No data available to export.");
      return;
    }
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(staff);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Staff Records");
      XLSX.writeFile(wb, "staff_records.xlsx");
    } catch (err) {
      console.error("Export Excel failed:", err);
      alert("Failed to export Excel. Please try again.");
    }
  };

  const handleExportPDF = async () => {
    if (staff.length === 0) {
      alert("No data available to export.");
      return;
    }
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(18);
      doc.text("KEMED Staff Records", 14, 22);
      
      const tableColumn = ["Staff ID", "Full Name", "School", "Job Grade", "Level Taught", "Phone"];
      const tableRows: any[] = [];
      
      staff.forEach(s => {
        const rowData = [
          s.staff_id,
          s.full_name,
          s.school_name || 'N/A',
          s.job_grade || '',
          s.level_taught || '',
          s.telephone || ''
        ];
        tableRows.push(rowData);
      });
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });
      
      doc.save("staff_records.pdf");
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-slate-800">Staff Records</h2>
           <p className="text-slate-500 font-medium mt-1">View and manage staff data entries.</p>
        </div>
        <div className="space-x-2 flex items-center">
          {user?.role !== "HEAD_TEACHER" && (
             <>
               <Button variant="outline" className="shadow-sm border-slate-200" onClick={handleExportCSV}>Export CSV</Button>
               <Button variant="secondary" className="shadow-sm" onClick={handleExportExcel}>Export Excel</Button>
               <Button variant="secondary" className="shadow-sm bg-red-600 text-white hover:bg-red-700 hover:text-white" onClick={handleExportPDF}>Export PDF</Button>
             </>
          )}
          {user?.role !== "ADMIN" && (
            <Link to="/staff/new">
              <Button className="bg-[#004d40] hover:bg-[#00332a] shadow-sm">Add New Staff</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#004d40]/5 text-xs text-[#004d40] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Staff ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4">Job / Grade</th>
                <th className="px-6 py-4">Level Taught</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{s.staff_id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{s.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.school_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-600">{s.job_grade}</td>
                  <td className="px-6 py-4 text-slate-600">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                       {s.level_taught}
                     </span>
                  </td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    {user?.role !== "ADMIN" && (
                       <Link to={`/staff/edit/${s.id}`} state={{ editData: s }}>
                         <Button variant="outline" size="sm" className="shadow-sm border-slate-200">Edit</Button>
                       </Link>
                    )}
                    {user?.role === "SUPER_ADMIN" && (
                      <Button variant="destructive" size="sm" className="shadow-sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                    )}
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
