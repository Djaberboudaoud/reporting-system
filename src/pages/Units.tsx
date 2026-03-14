import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { unitsAPI, companiesAPI } from "@/services/api";
import { Unit, Company } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Unit | null>(null);
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const [u, c] = await Promise.all([unitsAPI.getAll(), companiesAPI.getAll()]);
    setUnits(u.data);
    setCompanies(c.data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(""); setCompanyId(""); setEditItem(null); };

  const handleSave = async () => {
    try {
      const data = { name, company_id: Number(companyId) };
      if (editItem) {
        await unitsAPI.update(editItem.id, data);
        toast({ title: "Unit updated" });
      } else {
        await unitsAPI.create(data);
        toast({ title: "Unit created" });
      }
      setOpen(false); resetForm(); load();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this unit?")) return;
    try { await unitsAPI.delete(id); toast({ title: "Unit deleted" }); load(); }
    catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Cannot delete", variant: "destructive" }); }
  };

  const openEdit = (item: Unit) => { setEditItem(item); setName(item.name); setCompanyId(String(item.company_id)); setOpen(true); };
  const getCompanyName = (id: number) => companies.find((c) => c.id === id)?.name || "—";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Units</h1>
          <p className="mt-1 text-muted-foreground">Manage company units</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-cta text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Unit" : "Add Unit"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Unit name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Company</label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full gradient-cta text-primary-foreground">{editItem ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {units.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{u.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground"><div className="flex items-center gap-2"><Layers className="h-4 w-4 text-muted-foreground" />{u.name}</div></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getCompanyName(u.company_id)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {units.length === 0 && (<tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No units found</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Units;
