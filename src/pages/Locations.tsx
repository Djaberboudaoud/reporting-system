import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { locationsAPI } from "@/services/api";
import { Location } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Locations = () => {
  const [items, setItems] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const load = async () => { const res = await locationsAPI.getAll(); setItems(res.data); };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(""); setEditItem(null); };

  const handleSave = async () => {
    try {
      if (editItem) { await locationsAPI.update(editItem.id, { name }); toast({ title: "Location updated" }); }
      else { await locationsAPI.create({ name }); toast({ title: "Location created" }); }
      setOpen(false); resetForm(); load();
    } catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this location?")) return;
    try { await locationsAPI.delete(id); toast({ title: "Deleted" }); load(); }
    catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Cannot delete", variant: "destructive" }); }
  };

  const openEdit = (item: Location) => { setEditItem(item); setName(item.name); setOpen(true); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground md:text-3xl">Locations</h1><p className="mt-1 text-muted-foreground">Manage case locations</p></div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-cta text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Location</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Location" : "Add Location"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><label className="mb-1.5 block text-sm font-medium">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Location name" /></div>
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
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{item.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{item.name}</div></td>
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && (<tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No locations found</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Locations;
