import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { casesAPI } from "@/services/api";
import { Case } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CasesList = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await casesAPI.getAll(params);
      setCases(res.data);
    } catch { setCases([]); }
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this case?")) return;
    try { await casesAPI.delete(id); toast({ title: "Case deleted" }); load(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-foreground md:text-3xl">Cases</h1><p className="mt-1 text-muted-foreground">Manage and track your cases</p></div>
        <Link to="/cases/new">
          <Button className="gradient-cta text-primary-foreground hover:opacity-90 rounded-lg"><Plus className="mr-2 h-4 w-4" />New Case</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">{cases.length}</span> cases</p>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground">No cases found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or create a new case</p>
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">#{c.id}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{c.title}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground">Due:</span> {c.due_date || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/30 cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
                  <td className="px-4 py-3"><span className="text-sm font-semibold text-primary">#{c.id}</span></td>
                  <td className="px-4 py-3"><span className="text-sm font-medium text-foreground">{c.title}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.due_date || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/cases/${c.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default CasesList;
