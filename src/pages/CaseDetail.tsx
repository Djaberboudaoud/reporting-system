import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { casesAPI, companiesAPI, unitsAPI, locationsAPI, caseCategoriesAPI, caseTypesAPI, usersAPI } from "@/services/api";
import { Company, Unit, Location, CaseCategory, CaseType, User, Case } from "@/types";
import { useToast } from "@/hooks/use-toast";

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [editing, setEditing] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    Promise.all([
      casesAPI.getById(Number(id)), companiesAPI.getAll(), unitsAPI.getAll(),
      locationsAPI.getAll(), caseCategoriesAPI.getAll(), caseTypesAPI.getAll(), usersAPI.getAll(),
    ]).then(([c, co, un, lo, ca, ct, us]) => {
      setCaseData(c.data); setForm(c.data);
      setCompanies(co.data); setUnits(un.data); setLocations(lo.data);
      setCategories(ca.data); setCaseTypes(ct.data); setUsers(us.data);
    });
  }, [id]);

  const setField = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const getName = (list: any[], id: number | null | undefined) => list.find((i) => i.id === id)?.name || "—";

  const handleSave = async () => {
    try {
      const data = { ...form };
      delete data.id; delete data.created_at; delete data.updated_at;
      ["category_id", "case_type_id", "location_id", "company_id", "unit_id", "reported_by", "send_to"].forEach((k) => {
        data[k] = data[k] ? Number(data[k]) : null;
      });
      if (!data.due_date) data.due_date = null;
      await casesAPI.update(Number(id), data);
      toast({ title: "Case updated" });
      setEditing(false);
      const res = await casesAPI.getById(Number(id));
      setCaseData(res.data); setForm(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" });
    }
  };

  if (!caseData) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  const statusColors: Record<string, string> = {
    open: "bg-cyan-50 text-cyan-700 border-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-300",
    in_progress: "bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300",
    closed: "bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400",
  };

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-sm text-foreground">{value || "—"}</p></div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cases")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Case #{caseData.id}</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[caseData.status] || ""}`}>
                {caseData.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">{caseData.title}</p>
          </div>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gradient-cta text-primary-foreground"><Pencil className="mr-2 h-4 w-4" />Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); setForm(caseData); }}>Cancel</Button>
            <Button onClick={handleSave} className="gradient-cta text-primary-foreground"><Save className="mr-2 h-4 w-4" />Save</Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="Title" value={caseData.title} />
              <Field label="Status" value={caseData.status.replace("_", " ")} />
              <Field label="Due Date" value={caseData.due_date} />
              <div className="col-span-full"><Field label="Description" value={caseData.description} /></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Classification</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Field label="Category" value={getName(categories, caseData.category_id)} />
              <Field label="Type" value={getName(caseTypes, caseData.case_type_id)} />
              <Field label="Location" value={getName(locations, caseData.location_id)} />
              <Field label="Assign To" value={getName(users, caseData.send_to)} />
              <Field label="Company" value={getName(companies, caseData.company_id)} />
              <Field label="Unit" value={getName(units, caseData.unit_id)} />
              <Field label="Reported By" value={getName(users, caseData.reported_by)} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Work Activity" value={caseData.work_activity} />
              <Field label="System Involved" value={caseData.system_involved} />
              <Field label="Equipment Involved" value={caseData.equipment_involved} />
              <Field label="Equipment Description" value={caseData.equipment_description} />
              <Field label="Actual Consequences" value={caseData.actual_consequences} />
              <Field label="Potential Consequences" value={caseData.potential_consequences} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Root Causes</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Communication" value={caseData.communication_causes} />
              <Field label="Management" value={caseData.management_causes} />
              <Field label="Training" value={caseData.training_causes} />
              <Field label="Operating Environment" value={caseData.operating_environment_causes} />
              <Field label="Equipment" value={caseData.equipment_causes} />
            </div>
          </div>
          {caseData.comments && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-4 text-base font-bold">Comments</h3>
              <p className="text-sm text-foreground">{caseData.comments}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Edit Case</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Title</label><Input value={form.title || ""} onChange={(e) => setField("title", e.target.value)} /></div>
              <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Description</label><Textarea value={form.description || ""} onChange={(e) => setField("description", e.target.value)} /></div>
              <div><label className="mb-1.5 block text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Due Date</label><Input type="date" value={form.due_date || ""} onChange={(e) => setField("due_date", e.target.value)} /></div>
              <div><label className="mb-1.5 block text-sm font-medium">Category</label>
                <Select value={String(form.category_id || "")} onValueChange={(v) => setField("category_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Case Type</label>
                <Select value={String(form.case_type_id || "")} onValueChange={(v) => setField("case_type_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{caseTypes.map((t) => (<SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Location</label>
                <Select value={String(form.location_id || "")} onValueChange={(v) => setField("location_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{locations.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Assign To</label>
                <Select value={String(form.send_to || "")} onValueChange={(v) => setField("send_to", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{users.map((u) => (<SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Work Activity</label><Input value={form.work_activity || ""} onChange={(e) => setField("work_activity", e.target.value)} /></div>
              <div><label className="mb-1.5 block text-sm font-medium">System Involved</label><Input value={form.system_involved || ""} onChange={(e) => setField("system_involved", e.target.value)} /></div>
              <div className="md:col-span-2"><label className="mb-1.5 block text-sm font-medium">Comments</label><Textarea value={form.comments || ""} onChange={(e) => setField("comments", e.target.value)} /></div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CaseDetail;
