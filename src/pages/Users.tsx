import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog";

export function Users() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  
  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: "",
    name: "",
    role: "HEAD_TEACHER",
    password: "",
    school_id: ""
  });
  
  // Password Reset State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  
  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setUsers);
      
    fetch("/api/users/schools", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setSchools);
  }, [token]);

  if (user?.role !== "SUPER_ADMIN") return <div>Access denied</div>;

  const validateField = (name: string, value: string, currentFormData = formData, currentErrors: any = errors) => {
    const newErrors = { ...currentErrors };
    
    switch (name) {
      case "staff_id":
        if (!value) newErrors.staff_id = "Staff ID is required";
        else if (!/^\d+$/.test(value)) newErrors.staff_id = "Staff ID must contain only numbers";
        else delete newErrors.staff_id;
        break;
        
      case "name":
        if (!value) newErrors.name = "Name is required";
        else if (value.length < 2) newErrors.name = "Name must be at least 2 characters";
        else if (!/^[a-zA-Z\s'-]+$/.test(value)) newErrors.name = "Only letters, spaces, hyphens, and apostrophes allowed";
        else delete newErrors.name;
        break;
        
      case "password":
        if (!value) newErrors.password = "Password is required";
        else if (value.length < 8) newErrors.password = "Password must be at least 8 characters";
        else if (!/(?=.*[a-z])/.test(value)) newErrors.password = "Must contain at least one lowercase letter";
        else if (!/(?=.*[A-Z])/.test(value)) newErrors.password = "Must contain at least one uppercase letter";
        else if (!/(?=.*\d)/.test(value)) newErrors.password = "Must contain at least one number";
        else if (!/(?=.*[!@#$%^&*])/.test(value)) newErrors.password = "Must contain at least one special character (!@#$%^&*)";
        else delete newErrors.password;
        break;
        
      case "school_id":
         if (currentFormData.role === "HEAD_TEACHER" && !value) {
            newErrors.school_id = "School is required for Head Teachers";
         } else {
            delete newErrors.school_id;
         }
         break;
    }
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const newErrors = validateField(name, value, { ...formData, [name]: value }, errors);
    setErrors(newErrors);
  };
  
  const validateForm = () => {
    let currentErrors = { ...errors };
    currentErrors = validateField("staff_id", formData.staff_id, formData, currentErrors);
    currentErrors = validateField("name", formData.name, formData, currentErrors);
    currentErrors = validateField("password", formData.password, formData, currentErrors);
    currentErrors = validateField("school_id", formData.school_id, formData, currentErrors);
    setErrors(currentErrors);
    return Object.keys(currentErrors).filter(k => k !== 'submit').length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Ensure school_id is null for global roles if empty
    const payload = {
      ...formData,
      school_id: formData.role === "SUPER_ADMIN" ? null : (formData.school_id || null)
    };
    
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
       const resData = await res.json();
       // Add new user to list (simplification, re-fetch might be best)
       fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } })
         .then(r => r.json())
         .then(setUsers);
         
       setIsOpen(false);
       setFormData({ staff_id: "", name: "", role: "HEAD_TEACHER", password: "", school_id: "" });
       setErrors({});
    } else {
       const err = await res.json();
       setErrors({ ...errors, submit: err.error });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 8) {
      setResetError("Password must be at least 8 characters long.");
      return;
    }

    const res = await fetch(`/api/users/${resetUserId}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newPassword: resetPassword })
    });

    if (res.ok) {
      setIsResetOpen(false);
      setResetUserId(null);
      setResetPassword("");
      setResetError("");
      alert("Password successfully updated.");
    } else {
      const err = await res.json();
      setResetError(err.error || "Failed to reset password.");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-slate-800">User Management</h2>
           <p className="text-slate-500 font-medium mt-1">Manage administrators and school head teachers.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-[#004d40] hover:bg-[#00332a]">Add User</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new administrator or head teacher account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {errors.submit && <div className="text-red-500 bg-red-50 text-sm p-3 rounded-md">{errors.submit}</div>}
              <div className="space-y-2">
                <Label htmlFor="staff_id">Staff ID <span className="text-red-500">*</span></Label>
                <Input id="staff_id" name="staff_id" value={formData.staff_id} onChange={handleChange} />
                {errors.staff_id && <p className="text-xs text-red-500">{errors.staff_id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#004d40]">
                  <option value="HEAD_TEACHER">Head Teacher</option>
                  <option value="ADMIN">Statistics Officer</option>
                  <option value="SUPER_ADMIN">System Admin</option>
                </select>
              </div>
              {(formData.role === "HEAD_TEACHER" || formData.role === "ADMIN") && (
                <div className="space-y-2">
                  <Label htmlFor="school_id">Assign to School {formData.role === "HEAD_TEACHER" && <span className="text-red-500">*</span>}</Label>
                  <select id="school_id" name="school_id" value={formData.school_id} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#004d40]">
                    <option value="">-- Select a School --</option>
                    {schools.map(sch => (
                       <option key={sch.id} value={sch.id}>{sch.name}</option>
                    ))}
                  </select>
                  {errors.school_id && <p className="text-xs text-red-500">{errors.school_id}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#004d40] hover:bg-[#00332a]">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mt-8">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-700">System Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#004d40]/5 text-xs text-[#004d40] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Staff ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{u.staff_id}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{u.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20">
                       {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.school_name || <span className="text-slate-400 italic">Global Access</span>}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="shadow-sm font-semibold border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => {
                        setResetUserId(u.id);
                        setIsResetOpen(true);
                    }}>Reset Password</Button>
                    <Button variant="destructive" size="sm" className="shadow-sm font-semibold" onClick={async () => {
                        if(!confirm("Delete user?")) return;
                        await fetch(`/api/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
                        setUsers(users.filter(x => x.id !== u.id));
                    }}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Assign a new password to this user. They can use this to login immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            {resetError && <div className="text-red-500 bg-red-50 text-sm p-3 rounded-md">{resetError}</div>}
            <div className="space-y-2">
              <Label htmlFor="resetPassword">New Password <span className="text-red-500">*</span></Label>
              <Input id="resetPassword" name="resetPassword" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required />
              <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsResetOpen(false);
                setResetPassword("");
                setResetError("");
              }}>Cancel</Button>
              <Button type="submit" className="bg-[#004d40] hover:bg-[#00332a]">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
