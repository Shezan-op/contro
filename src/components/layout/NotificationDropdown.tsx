"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { NotificationService } from "@/services/NotificationService";
import type { Notification } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const { workspaceId } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!workspaceId) return;
    const all = await NotificationService.getAll(workspaceId);
    setNotifications(all);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s for demo
    return () => clearInterval(interval);
  }, [workspaceId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!workspaceId) return;
    await NotificationService.markAllAsRead(workspaceId);
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await NotificationService.delete(id);
    fetchNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition group"
        aria-label="Notifications"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--background)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-12 left-0 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]"
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50 backdrop-blur-sm">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 transition"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-[var(--muted)] text-sm flex flex-col items-center">
                  <Bell size={24} className="mb-2 opacity-20" />
                  No notifications yet.
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className={`relative group p-3 rounded-lg border flex flex-col gap-1 transition-colors ${
                        notif.isRead 
                          ? "bg-[var(--background)] border-transparent opacity-70" 
                          : "bg-[var(--surface)] border-[var(--border)] shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-sm font-medium ${!notif.isRead ? "text-[var(--text)]" : ""}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {!notif.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-1 rounded bg-[var(--background)] hover:bg-[var(--text)] hover:text-[var(--background)] transition"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(notif.id)}
                            className="p-1 rounded bg-[var(--background)] hover:bg-red-500 hover:text-white transition text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-[var(--muted)] opacity-70 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                      {!notif.isRead && (
                        <div className="absolute top-3 left-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
