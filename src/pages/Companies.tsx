import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { companiesAPI } from "@/services/api";
import { Company } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("internal");
  const { toast } = useToast();

  const load = async () => {
    const res = await companiesAPI.getAll();
    setCompanies(res.data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(""); setType("internal"); setEditItem(null); };

  const handleSave = async () => {
    try {
      if (editItem) {
        await companiesAPI.update(editItem.id, { name, type });
        toast({ title: "Company updated" });
      } else {
        await companiesAPI.create({ name, type });
        toast({ title: "Company created" });
      }
      setOpen(false);
      resetForm();
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this company?")) return;
    try {
      await companiesAPI.delete(id);
      toast({ title: "Company deleted" });
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Cannot delete", variant: "destructive" });
    }
  };

  const openEdit = (item: Company) => {
    setEditItem(item);
    setName(item.name);
    setType(item.type);
    setOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Companies</h1>
          <p className="mt-1 text-muted-foreground">Manage companies in the system</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-cta text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Company" : "Add Company"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full gradient-cta text-primary-foreground">
                {editItem ? "Update" : "Create"}
              </Button>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {companies.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{c.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {c.name}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    c.type === "internal"
                      ? "bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No companies found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Companies;
