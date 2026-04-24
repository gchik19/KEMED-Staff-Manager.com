import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function StaffForm() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;

  const [formData, setFormData] = useState<any>(editData || {
    staff_id: "",
    first_name: "",
    surname: "",
    other_names: "",
    job_grade: "",
    highest_qualification: "",
    qualification_institution: "",
    level_taught: "",
    class_taught: "",
    subject_taught: "",
    additional_responsibility: "",
    dob: "",
    ssnit_number: "",
    ghana_card_number: "",
    management_unit: "",
    payroll_active: true,
    at_post_or_leave: "AT_POST",
    leave_type: "",
    bank_name: "",
    account_number: "",
    telephone: "",
    school_id: user?.school_id || ""
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: any, currentErrors: any = errors) => {
    const newErrors = { ...currentErrors };
    let stringVal = value ? String(value) : "";
    
    switch (name) {
      case "staff_id":
        if (!stringVal) newErrors[name] = "Staff ID is required";
        else if (!/^\d+$/.test(stringVal)) newErrors[name] = "Staff ID must contain only numbers";
        else delete newErrors[name];
        break;
      
      case "first_name":
      case "surname":
        if (!stringVal) newErrors[name] = "This field is required";
        else if (stringVal.length < 2) newErrors[name] = "Must be at least 2 characters";
        else if (!/^[a-zA-Z\s'-]+$/.test(stringVal)) newErrors[name] = "Only letters, spaces, hyphens, or apostrophes allowed";
        else delete newErrors[name];
        break;
        
      case "other_names":
        if (stringVal && !/^[a-zA-Z\s'-]*$/.test(stringVal)) newErrors[name] = "Only letters, spaces, hyphens, or apostrophes allowed";
        else delete newErrors[name];
        break;

      case "dob":
        if (!stringVal) newErrors[name] = "Date of Birth is required";
        else {
           const inputDate = new Date(stringVal);
           const today = new Date();
           let age = today.getFullYear() - inputDate.getFullYear();
           const m = today.getMonth() - inputDate.getMonth();
           if (m < 0 || (m === 0 && today.getDate() < inputDate.getDate())) {
              age--;
           }
           if (age < 18) newErrors[name] = "Must be at least 18 years old";
           else if (age > 65) newErrors[name] = "Cannot be older than 65 years";
           else delete newErrors[name];
        }
        break;
        
      case "telephone":
        if (stringVal && !/^\d{10}$/.test(stringVal)) newErrors[name] = "Telephone must be exactly 10 digits";
        else delete newErrors[name];
        break;
        
      case "ssnit_number":
        if (stringVal && stringVal.length < 13) newErrors[name] = "SSNIT number usually has 13 or 15 characters";
        else if (stringVal && !/^[A-Za-z0-9]+$/.test(stringVal)) newErrors[name] = "Alphanumeric only";
        else delete newErrors[name];
        break;
        
      case "ghana_card_number":
        if (stringVal && !/^GHA-[0-9]{9}-[0-9]$/.test(stringVal)) newErrors[name] = "Must match format GHA-XXXXXXXXX-X";
        else delete newErrors[name];
        break;
    }
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const id = e.target.id || e.target.name;
    let value: any = e.target.value;
    if (e.target.type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    }
    setFormData({ ...formData, [id]: value });
    const newErrors = validateField(id, value);
    setErrors(newErrors);
  };
  
  const validateForm = () => {
     let currentErrors = { ...errors };
     
     const fieldsToValidate = ["staff_id", "first_name", "surname", "other_names", "dob", "telephone", "ssnit_number", "ghana_card_number"];
     fieldsToValidate.forEach(field => {
        currentErrors = validateField(field, formData[field], currentErrors);
     });
     
     setErrors(currentErrors);
     return Object.keys(currentErrors).filter(k => k !== 'submit').length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Auto calculate age and years to retirement
    if (formData.dob) {
       const birthYear = new Date(formData.dob).getFullYear();
       const currentYear = new Date().getFullYear();
       formData.age = currentYear - birthYear;
       formData.years_to_retirement = 60 - formData.age;
    }

    const url = editData ? `/api/staff/${editData.id}` : "/api/staff";
    const method = editData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      navigate("/staff");
    } else {
      const err = await res.json();
      setErrors({ ...errors, submit: err.error || "Failed to save" });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-slate-800">{editData ? "Edit Staff Record" : "Add New Staff"}</h2>
           <p className="text-slate-500 font-medium mt-1">Please fill in the employee fields below based on the current term.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-700">Official Details</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {errors.submit && <div className="text-red-500 bg-red-50 text-sm p-3 rounded-md">{errors.submit}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="staff_id" className="font-semibold text-slate-700">Staff ID <span className="text-red-500">*</span></Label>
              <Input id="staff_id" value={formData.staff_id} onChange={handleChange} required className={`shadow-sm focus-visible:ring-[#004d40] ${errors.staff_id ? 'border-red-500' : ''}`} />
              {errors.staff_id && <p className="text-xs text-red-500">{errors.staff_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name" className="font-semibold text-slate-700">First Name <span className="text-red-500">*</span></Label>
              <Input id="first_name" value={formData.first_name} onChange={handleChange} required className={`shadow-sm focus-visible:ring-[#004d40] ${errors.first_name ? 'border-red-500' : ''}`} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="font-semibold text-slate-700">Surname <span className="text-red-500">*</span></Label>
              <Input id="surname" value={formData.surname} onChange={handleChange} required className={`shadow-sm focus-visible:ring-[#004d40] ${errors.surname ? 'border-red-500' : ''}`} />
              {errors.surname && <p className="text-xs text-red-500">{errors.surname}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_names" className="font-semibold text-slate-700">Other Names</Label>
              <Input id="other_names" value={formData.other_names} onChange={handleChange} className={`shadow-sm focus-visible:ring-[#004d40] ${errors.other_names ? 'border-red-500' : ''}`} />
              {errors.other_names && <p className="text-xs text-red-500">{errors.other_names}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="font-semibold text-slate-700">Date of Birth <span className="text-red-500">*</span></Label>
              <Input id="dob" type="date" value={formData.dob} onChange={handleChange} required className={`shadow-sm focus-visible:ring-[#004d40] ${errors.dob ? 'border-red-500' : ''}`} />
              {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="level_taught" className="font-semibold text-slate-700">Level Taught</Label>
              <select
                id="level_taught"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#004d40] disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.level_taught}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="KG">KG</option>
                <option value="PRIMARY">Primary</option>
                <option value="JHS">JHS</option>
                <option value="SHS">SHS</option>
              </select>
            </div>
            <div className="space-y-2">
               <Label htmlFor="at_post_or_leave" className="font-semibold text-slate-700">Status</Label>
               <select 
                 id="at_post_or_leave" 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#004d40] disabled:cursor-not-allowed disabled:opacity-50" 
                 value={formData.at_post_or_leave} 
                 onChange={handleChange}
               >
                 <option value="AT_POST">At Post</option>
                 <option value="ON_LEAVE">On Leave</option>
               </select>
            </div>
            {formData.at_post_or_leave === "ON_LEAVE" && (
               <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                 <Label htmlFor="leave_type" className="font-semibold text-slate-700">Leave Type</Label>
                 <Input id="leave_type" value={formData.leave_type} onChange={handleChange} className="shadow-sm focus-visible:ring-[#004d40] border-amber-300 bg-amber-50" />
               </div>
            )}
            
            {/* Additional mapped fields */}
            {['highest_qualification', 'telephone', 'ssnit_number', 'ghana_card_number'].map(k => (
               <div key={k} className="space-y-2">
                  <Label htmlFor={k} className="font-semibold text-slate-700">{k.replace(/_/g, ' ').toUpperCase()}</Label>
                  <Input id={k} value={formData[k]} onChange={handleChange} className={`shadow-sm focus-visible:ring-[#004d40] ${errors[k] ? 'border-red-500' : ''}`} />
                  {errors[k] && <p className="text-xs text-red-500">{errors[k]}</p>}
               </div>
            ))}

            {user?.role === "SUPER_ADMIN" && (
               <div className="space-y-2">
                 <Label htmlFor="school_id" className="font-semibold text-slate-700 text-[#004d40]">School ID (SuperAdmin Override)</Label>
                 <Input id="school_id" type="number" value={formData.school_id} onChange={handleChange} required className="shadow-sm focus-visible:ring-[#004d40] border-[#004d40]/30" />
               </div>
            )}

          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" className="shadow-sm" onClick={() => navigate("/staff")}>Cancel</Button>
            <Button type="submit" className="bg-[#004d40] hover:bg-[#00332a] shadow-sm tracking-wide" disabled={Object.keys(errors).filter(k => k !== 'submit').length > 0}>Save Record</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
