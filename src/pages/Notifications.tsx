import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsAPI } from "@/services/api";
import { Notification } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Notifications = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = async () => {
    if (!user) return;
    const res = await notificationsAPI.getByUser(user.user_id);
    setItems(res.data);
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (id: number) => {
    await notificationsAPI.markAsRead(id);
    load();
  };

  const markAllRead = async () => {
    if (!user) return;
    await notificationsAPI.markAllRead(user.user_id);
    toast({ title: "All notifications marked as read" });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Notifications</h1>
          <p className="mt-1 text-muted-foreground">{items.filter((n) => !n.is_read).length} unread notifications</p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={items.every((n) => n.is_read)}>
          <CheckCheck className="mr-2 h-4 w-4" />Mark All Read
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between rounded-xl border border-border p-4 transition-all ${
              n.is_read ? "bg-card" : "bg-primary/5 border-primary/20"
            } shadow-card hover:shadow-card-hover`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                n.is_read ? "bg-secondary" : "gradient-primary"
              }`}>
                <Bell className={`h-5 w-5 ${n.is_read ? "text-muted-foreground" : "text-primary-foreground"}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                  Notification for{" "}
                  <Link to={`/cases/${n.case_id}`} className="text-primary hover:underline">Case #{n.case_id}</Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </p>
              </div>
            </div>
            {!n.is_read && (
              <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                <Check className="mr-1 h-4 w-4" />Read
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
