import { useState, useEffect } from "react";
import { FileText, Clock, TrendingUp, CheckCircle, Plus, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardAPI, casesAPI } from "@/services/api";
import { DashboardStats, Case } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);

  useEffect(() => {
    dashboardAPI.getStats().then((res) => setStats(res.data)).catch(() => {});
    casesAPI.getAll().then((res) => setRecentCases(res.data.slice(0, 5))).catch(() => {});
  }, []);

  const statCards = stats
    ? [
        { title: "Total Cases", count: stats.total_cases, icon: FileText, color: "from-cyan-500 to-cyan-600" },
        { title: "Open Cases", count: stats.open_cases, icon: Clock, color: "from-blue-500 to-blue-600" },
        { title: "In Progress", count: stats.in_progress_cases, icon: TrendingUp, color: "from-amber-500 to-amber-600" },
        { title: "Closed", count: stats.closed_cases, icon: CheckCircle, color: "from-green-500 to-green-600" },
        { title: "Companies", count: stats.total_companies, icon: Building2, color: "from-purple-500 to-purple-600" },
        { title: "Users", count: stats.total_users, icon: Users, color: "from-pink-500 to-pink-600" },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back{user ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your cases and system stats.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.title} className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stat.count}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
          </div>
        ))}
      </motion.div>

      {/* Quick Action */}
      <motion.div variants={item}>
        <Link to="/cases/new">
          <div className="flex items-center justify-between rounded-xl gradient-cta p-5 text-primary-foreground shadow-card transition-all hover:opacity-90">
            <div>
              <h3 className="text-lg font-bold">Create a New Case</h3>
              <p className="text-sm opacity-90">Start tracking a new case or report</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Plus className="h-5 w-5" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Cases */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-bold text-foreground">Recent Cases</h2>
            <Link to="/cases"><Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All</Button></Link>
          </div>
          <div className="divide-y divide-border">
            {recentCases.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No cases yet. Create your first case!</div>
            )}
            {recentCases.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`}>
                <div className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">#{c.id}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">{c.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.due_date || ""}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
