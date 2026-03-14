import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { caseTypesAPI, caseCategoriesAPI } from "@/services/api";
import { CaseType, CaseCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

const CaseTypes = () => {
  const [items, setItems] = useState<CaseType[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<CaseType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const [t, c] = await Promise.all([caseTypesAPI.getAll(), caseCategoriesAPI.getAll()]);
    setItems(t.data); setCategories(c.data);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(""); setDescription(""); setCategoryId(""); setEditItem(null); };

  const handleSave = async () => {
    try {
      const data = { name, description: description || undefined, category_id: Number(categoryId) };
      if (editItem) { await caseTypesAPI.update(editItem.id, data); toast({ title: "Type updated" }); }
      else { await caseTypesAPI.create(data); toast({ title: "Type created" }); }
      setOpen(false); resetForm(); load();
    } catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this type?")) return;
    try { await caseTypesAPI.delete(id); toast({ title: "Deleted" }); load(); }
    catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Cannot delete", variant: "destructive" }); }
  };

  const openEdit = (item: CaseType) => { setEditItem(item); setName(item.name); setDescription(item.description || ""); setCategoryId(String(item.category_id)); setOpen(true); };
  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground md:text-3xl">Case Types</h1><p className="mt-1 text-muted-foreground">Manage case types</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-cta text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Type</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Type" : "Add Type"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><label className="mb-1.5 block text-sm font-medium">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type name" /></div>
              <div><label className="mb-1.5 block text-sm font-medium">Category</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" /></div>
              <Button onClick={handleSave} className="w-full gradient-cta text-primary-foreground">{editItem ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{item.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground"><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" />{item.name}</div></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getCategoryName(item.category_id)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{item.description || "—"}</td>
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && (<tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No types found</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CaseTypes;
