import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { casesAPI, companiesAPI, unitsAPI, locationsAPI, caseCategoriesAPI, caseTypesAPI, usersAPI } from "@/services/api";
import { Company, Unit, Location, CaseCategory, CaseType, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-card">
    <h3 className="mb-4 text-base font-bold text-foreground">{title}</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  </div>
);

const CreateCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", category_id: "", case_type_id: "", location_id: "",
    company_id: "", unit_id: "", send_to: "", work_activity: "", system_involved: "",
    system_description: "", status: "open", equipment_involved: "", equipment_description: "",
    actual_consequences: "", potential_consequences: "", communication_causes: "",
    management_causes: "", training_causes: "", operating_environment_causes: "",
    equipment_causes: "", comments: "", due_date: "",
  });

  useEffect(() => {
    Promise.all([
      companiesAPI.getAll(), unitsAPI.getAll(), locationsAPI.getAll(),
      caseCategoriesAPI.getAll(), caseTypesAPI.getAll(), usersAPI.getAll(),
    ]).then(([co, un, lo, ca, ct, us]) => {
      setCompanies(co.data); setUnits(un.data); setLocations(lo.data);
      setCategories(ca.data); setCaseTypes(ct.data); setUsers(us.data);
    });
  }, []);

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filteredUnits = form.company_id ? units.filter((u) => u.company_id === Number(form.company_id)) : units;
  const filteredTypes = form.category_id ? caseTypes.filter((t) => t.category_id === Number(form.category_id)) : caseTypes;

  const handleSubmit = async () => {
    if (!form.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const data: any = { ...form, reported_by: user?.user_id };
      // Convert string ids to numbers or null
      ["category_id", "case_type_id", "location_id", "company_id", "unit_id", "send_to"].forEach((k) => {
        data[k] = data[k] ? Number(data[k]) : null;
      });
      if (!data.due_date) data.due_date = null;
      await casesAPI.create(data);
      toast({ title: "Case created successfully" });
      navigate("/cases");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to create case", variant: "destructive" });
    } finally { setLoading(false); }
  };



  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold text-foreground md:text-3xl">Create New Case</h1><p className="mt-1 text-muted-foreground">Fill in the details to create a new case</p></div>
      </div>

      <Section title="Basic Information">
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Title *</label><Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Case title" /></div>
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Description</label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the case" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Status</label>
          <Select value={form.status} onValueChange={(v) => setField("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
          </Select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium">Due Date</label><Input type="date" value={form.due_date} onChange={(e) => setField("due_date", e.target.value)} /></div>
      </Section>

      <Section title="Classification">
        <div><label className="mb-1.5 block text-sm font-medium">Category</label>
          <Select value={form.category_id} onValueChange={(v) => { setField("category_id", v); setField("case_type_id", ""); }}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium">Case Type</label>
          <Select value={form.case_type_id} onValueChange={(v) => setField("case_type_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{filteredTypes.map((t) => (<SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium">Location</label>
          <Select value={form.location_id} onValueChange={(v) => setField("location_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
            <SelectContent>{locations.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium">Assign To</label>
          <Select value={form.send_to} onValueChange={(v) => setField("send_to", v)}>
            <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
            <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Company & Unit">
        <div><label className="mb-1.5 block text-sm font-medium">Company</label>
          <Select value={form.company_id} onValueChange={(v) => { setField("company_id", v); setField("unit_id", ""); }}>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium">Unit</label>
          <Select value={form.unit_id} onValueChange={(v) => setField("unit_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>{filteredUnits.map((u) => (<SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Activity & Systems">
        <div><label className="mb-1.5 block text-sm font-medium">Work Activity</label><Input value={form.work_activity} onChange={(e) => setField("work_activity", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">System Involved</label><Input value={form.system_involved} onChange={(e) => setField("system_involved", e.target.value)} /></div>
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">System Description</label><Textarea value={form.system_description} onChange={(e) => setField("system_description", e.target.value)} /></div>
      </Section>

      <Section title="Equipment">
        <div><label className="mb-1.5 block text-sm font-medium">Equipment Involved</label><Input value={form.equipment_involved} onChange={(e) => setField("equipment_involved", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Equipment Description</label><Input value={form.equipment_description} onChange={(e) => setField("equipment_description", e.target.value)} /></div>
      </Section>

      <Section title="Consequences">
        <div><label className="mb-1.5 block text-sm font-medium">Actual Consequences</label><Textarea value={form.actual_consequences} onChange={(e) => setField("actual_consequences", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Potential Consequences</label><Textarea value={form.potential_consequences} onChange={(e) => setField("potential_consequences", e.target.value)} /></div>
      </Section>

      <Section title="Root Causes">
        <div><label className="mb-1.5 block text-sm font-medium">Communication Causes</label><Textarea value={form.communication_causes} onChange={(e) => setField("communication_causes", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Management Causes</label><Textarea value={form.management_causes} onChange={(e) => setField("management_causes", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Training Causes</label><Textarea value={form.training_causes} onChange={(e) => setField("training_causes", e.target.value)} /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Operating Environment Causes</label><Textarea value={form.operating_environment_causes} onChange={(e) => setField("operating_environment_causes", e.target.value)} /></div>
        <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Equipment Causes</label><Textarea value={form.equipment_causes} onChange={(e) => setField("equipment_causes", e.target.value)} /></div>
      </Section>

      <Section title="Comments">
        <div className="md:col-span-2"><Textarea value={form.comments} onChange={(e) => setField("comments", e.target.value)} placeholder="Additional comments..." rows={4} /></div>
      </Section>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} className="gradient-cta text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />{loading ? "Creating..." : "Create Case"}
        </Button>
      </div>
    </motion.div>
  );
};

export default CreateCase;
