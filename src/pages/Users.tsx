import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usersAPI, companiesAPI, unitsAPI } from "@/services/api";
import { User, Company, Unit } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "basic", company_id: "", unit_id: "", password: "" });
  const { toast } = useToast();

  const load = async () => {
    const [u, c, un] = await Promise.all([usersAPI.getAll(), companiesAPI.getAll(), unitsAPI.getAll()]);
    setUsers(u.data); setCompanies(c.data); setUnits(un.data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", email: "", role: "basic", company_id: "", unit_id: "", password: "" }); setEditItem(null); };
  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      const data: any = { ...form, company_id: Number(form.company_id), unit_id: Number(form.unit_id) };
      if (editItem) {
        if (!data.password) delete data.password;
        await usersAPI.update(editItem.id, data);
        toast({ title: "User updated" });
      } else {
        await usersAPI.create(data);
        toast({ title: "User created" });
      }
      setOpen(false); resetForm(); load();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try { await usersAPI.delete(id); toast({ title: "User deleted" }); load(); }
    catch (err: any) { toast({ title: "Error", description: err.response?.data?.detail || "Cannot delete", variant: "destructive" }); }
  };

  const openEdit = (item: User) => {
    setEditItem(item);
    setForm({ name: item.name, email: item.email, role: item.role, company_id: String(item.company_id), unit_id: String(item.unit_id), password: "" });
    setOpen(true);
  };

  const getCompanyName = (id: number) => companies.find((c) => c.id === id)?.name || "—";
  const getUnitName = (id: number) => units.find((u) => u.id === id)?.name || "—";

  const filteredUnits = form.company_id ? units.filter((u) => u.company_id === Number(form.company_id)) : units;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Users</h1>
          <p className="mt-1 text-muted-foreground">Manage system users</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-cta text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editItem ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Email" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Role</label>
                <Select value={form.role} onValueChange={(v) => setField("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="extensive">Extensive</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Company</label>
                <Select value={form.company_id} onValueChange={(v) => { setField("company_id", v); setField("unit_id", ""); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Unit</label>
                <Select value={form.unit_id} onValueChange={(v) => setField("unit_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{filteredUnits.map((u) => (<SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Password{editItem && " (leave blank to keep)"}</label>
                <Input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} placeholder="Password" />
              </div>
              <div className="col-span-2">
                <Button onClick={handleSave} className="w-full gradient-cta text-primary-foreground">{editItem ? "Update" : "Create"}</Button>
              </div>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 text-sm font-semibold text-primary">{u.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground"><div className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-muted-foreground" />{u.name}</div></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 border-green-400 dark:bg-green-900/30 dark:text-green-300">{u.role}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getCompanyName(u.company_id)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{getUnitName(u.unit_id)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (<tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>)}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Users;
