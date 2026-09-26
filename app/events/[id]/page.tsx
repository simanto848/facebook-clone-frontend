"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Check,
  Star,
  Share2,
  Clock,
  ExternalLink,
  Sparkles,
  Download,
  MessageSquare,
  Pencil,
  Send,
  Heart,
  Search,
  X,
  Bell,
  BellRing,
} from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { eventService } from "@/services/eventService";
import { useChatStore } from "@/store/chatStore";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
  EmptyState,
  Dialog,
} from "@/components/ui";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { openChat } = useChatStore();

  const [event, setEvent] = useState<any>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "interested" | "declined" | null>(null);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [attendeeFilter, setAttendeeFilter] = useState<"ALL" | "GOING" | "INTERESTED">("ALL");
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [rsvpToast, setRsvpToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    coverUrl: "",
  });
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ended: boolean;
  } | null>(null);

  useEffect(() => {
    if (!event?.startTime) return;
    const calculate = () => {
      const diff = new Date(event.startTime).getTime() - Date.now();
      if (isNaN(diff)) {
        setCountdown(null);
        return;
      }
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds, ended: false });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [event?.startTime]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("event_reminders");
      if (stored) {
        const reminders = JSON.parse(stored);
        setReminderSet(!!reminders[id]);
      }
    } catch {
      // ignore
    }
  }, [id]);

  const handleToggleReminder = () => {
    try {
      const stored = localStorage.getItem("event_reminders");
      const reminders = stored ? JSON.parse(stored) : {};
      const nextState = !reminderSet;
      if (nextState) {
        reminders[id] = {
          eventId: id,
          title: event?.title || "Upcoming Event",
          startTime: event?.startTime,
          createdAt: new Date().toISOString(),
        };
        setRsvpToast({
          message: "Reminder enabled! You will be reminded before this event starts.",
          type: "success",
        });
      } else {
        delete reminders[id];
        setRsvpToast({
          message: "Event reminder disabled.",
          type: "info",
        });
      }
      localStorage.setItem("event_reminders", JSON.stringify(reminders));
      setReminderSet(nextState);
    } catch {
      setReminderSet(!reminderSet);
    }
  };

  const [newCommentText, setNewCommentText] = useState("");
  const [discussions, setDiscussions] = useState<
    Array<{
      id: string;
      author: string;
      avatar: string;
      content: string;
      createdAt: string;
      likes: number;
      isLiked?: boolean;
    }>
  >([
    {
      id: "c1",
      author: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
      content: "Will the recorded workshops and slide decks be made available for online attendees after the event?",
      createdAt: "2 hours ago",
      likes: 4,
    },
    {
      id: "c2",
      author: "David Kim",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      content: "Looking forward to meeting fellow layout engineers in person! Anyone interested in a coffee sync before the keynote?",
      createdAt: "5 hours ago",
      likes: 7,
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newEntry = {
      id: `comm-${Date.now()}`,
      author: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      content: newCommentText.trim(),
      createdAt: "Just now",
      likes: 0,
      isLiked: false,
    };
    setDiscussions((prev) => [newEntry, ...prev]);
    setNewCommentText("");
  };

  const handleToggleLikeComment = (commentId: string) => {
    setDiscussions((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
        };
      })
    );
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await eventService.getEventById(id);
        const data = res.data || res;
        if (data) {
          setEvent(data);
          const rsvps = data.rsvps || [];
          setAttendeesCount(data._count?.rsvps || rsvps.length || 0);
          if (data.userRsvp) {
            setRsvpStatus(data.userRsvp.status?.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Fetch event detail error:", err);
        // Fallback demo data if id is not found in backend
        setEvent({
          id,
          title: "NextJS Architecture Conf 2026",
          description: "Explore the new architectural patterns of React 19, Server Actions optimization, and Next.js compiler advancements with world-class engineers.",
          coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200",
          location: "San Francisco, CA & Online Stream",
          startTime: "2026-10-20T09:00:00.000Z",
          endTime: "2026-10-21T18:00:00.000Z",
          category: "Conference",
          creator: {
            name: "React & Next.js Core Alliance",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          },
        });
        setAttendeesCount(2450);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRsvp = async (status: "going" | "interested" | "declined") => {
    const prevStatus = rsvpStatus;
    const isTogglingOff = prevStatus === status;
    const newStatus = isTogglingOff ? null : status;
    setRsvpStatus(newStatus);

    if (newStatus === "going" && prevStatus !== "going") {
      setAttendeesCount((c) => c + 1);
      setRsvpToast({ message: "🎉 You're going to this event! Saved to your schedule.", type: "success" });
    } else if (prevStatus === "going" && newStatus !== "going") {
      setAttendeesCount((c) => Math.max(0, c - 1));
      setRsvpToast({ message: "RSVP removed from this event.", type: "info" });
    } else if (newStatus === "interested") {
      setRsvpToast({ message: "⭐ Marked as interested! We'll keep you notified.", type: "info" });
    } else if (!newStatus) {
      setRsvpToast({ message: "RSVP status cleared.", type: "info" });
    }

    setTimeout(() => {
      setRsvpToast((curr) => (curr?.message ? null : curr));
    }, 3500);

    try {
      if (newStatus) {
        await eventService.rsvpEvent(id, newStatus);
      }
    } catch (err) {
      console.error("RSVP update error:", err);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCalendar = () => {
    if (!event) return;
    const title = event.title || "Event";
    const description = event.description || "";
    const location = event.location || "";
    const start = event.startTime ? new Date(event.startTime) : new Date();
    const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Facebook Clone//Event Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id || Date.now()}@facebookclone.local`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddToGoogleCalendar = () => {
    if (!event) return;
    const title = encodeURIComponent(event.title || "Event");
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    let start = new Date();
    if (event.startTime) {
      const parsed = new Date(event.startTime);
      if (!isNaN(parsed.getTime())) start = parsed;
    } else if (event.startDate) {
      const parsed = new Date(event.startDate);
      if (!isNaN(parsed.getTime())) start = parsed;
    }
    let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    if (event.endTime) {
      const parsed = new Date(event.endTime);
      if (!isNaN(parsed.getTime())) end = parsed;
    }
    const formatGCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    if (typeof window !== "undefined") {
      window.open(gcalUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleAddToOutlookCalendar = () => {
    if (!event) return;
    const title = encodeURIComponent(event.title || "Event");
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    let start = new Date();
    if (event.startTime) {
      const parsed = new Date(event.startTime);
      if (!isNaN(parsed.getTime())) start = parsed;
    } else if (event.startDate) {
      const parsed = new Date(event.startDate);
      if (!isNaN(parsed.getTime())) start = parsed;
    }
    let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    if (event.endTime) {
      const parsed = new Date(event.endTime);
      if (!isNaN(parsed.getTime())) end = parsed;
    }
    const startISO = encodeURIComponent(start.toISOString());
    const endISO = encodeURIComponent(end.toISOString());
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${startISO}&enddt=${endISO}`;
    if (typeof window !== "undefined") {
      window.open(outlookUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenEdit = () => {
    if (!event) return;
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
      coverUrl: event.coverUrl || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim() || savingEdit) return;
    setSavingEdit(true);

    try {
      await eventService.updateEvent(event.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        startTime: editForm.startTime ? new Date(editForm.startTime).toISOString() : undefined,
        coverUrl: editForm.coverUrl.trim() || undefined,
      });
    } catch (err) {
      console.warn("Backend updateEvent failed, updating local state:", err);
    }

    setEvent((prev: any) => ({
      ...prev,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      location: editForm.location.trim(),
      startTime: editForm.startTime ? new Date(editForm.startTime).toISOString() : prev.startTime,
      coverUrl: editForm.coverUrl.trim() || prev.coverUrl,
    }));

    setSavingEdit(false);
    setIsEditModalOpen(false);
  };

  const startDateFormatted = event?.startTime
    ? new Date(event.startTime).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : event?.startDate || "TBD";

  const startTimeFormatted = event?.startTime
    ? new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center pb-12">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.push("/events")}
                className="text-slate-400 hover:text-white"
              >
                Back to Events
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Pencil size={14} />}
                  onClick={handleOpenEdit}
                  disabled={!event}
                  className="border border-[#1f2937] text-slate-300 hover:text-white"
                >
                  Edit Event
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleExportCalendar}
                  disabled={!event}
                  className="border border-[#1f2937] text-slate-300 hover:text-white"
                >
                  Export .ics
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ExternalLink size={14} />}
                  onClick={handleAddToGoogleCalendar}
                  disabled={!event}
                  className="border border-[#1f2937] text-slate-300 hover:text-white"
                >
                  Google Calendar
                </Button>
                <Button
                  variant={reminderSet ? "success" : "secondary"}
                  size="sm"
                  leftIcon={reminderSet ? <BellRing size={14} className="text-emerald-400 animate-pulse" /> : <Bell size={14} />}
                  onClick={handleToggleReminder}
                  disabled={!event}
                  className={reminderSet ? "border border-emerald-500/50 bg-emerald-950/30 text-emerald-300" : "border border-[#1f2937] text-slate-300 hover:text-white"}
                >
                  {reminderSet ? "Reminder Set" : "Remind Me"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  onClick={handleShare}
                >
                  {copied ? "Link Copied!" : "Share Event"}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <Loader label="Loading event information..." />
              </div>
            ) : !event ? (
              <EmptyState
                icon={<Calendar size={40} className="text-slate-500" />}
                title="Event not found"
                description="The requested event might have been removed or is no longer accessible."
                action={
                  <Button onClick={() => router.push("/events")}>Browse Other Events</Button>
                }
              />
            ) : (
              <div className="space-y-6">
                {rsvpToast && (
                  <div
                    className={`flex items-center justify-between p-3.5 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
                      rsvpToast.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    }`}
                  >
                    <span className="text-xs font-semibold">{rsvpToast.message}</span>
                    <button
                      onClick={() => setRsvpToast(null)}
                      className="text-xs text-slate-400 hover:text-white p-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Cover Banner Card */}
                <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-[#1f2937] shadow-2xl">
                  <Image
                    src={
                      event.coverUrl ||
                      event.coverImage ||
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    alt={event.title}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="glass" className="text-xs px-3 py-1 font-semibold">
                      {event.category || "Event"}
                    </Badge>
                  </div>
                </div>

                {/* Event Heading & RSVP Action Bar */}
                <Card className="border-[#1f2937] bg-[#111827]/80 backdrop-blur-md">
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {event.title}
                      </h1>
                      {event.creator && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                          <span>Organized by</span>
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <Avatar
                              src={event.creator.avatar || event.creator.avatarUrl}
                              name={event.creator.name || "Organizer"}
                              size="xs"
                            />
                            <span>{event.creator.name || event.creator.username || "Community Host"}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-[#1f2937]">
                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{startDateFormatted}</p>
                          {startTimeFormatted && (
                            <p className="text-slate-400 mt-0.5">{startTimeFormatted} onwards</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400 shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{event.location || "Online Event"}</p>
                          <p className="text-slate-400 mt-0.5">Physical & Virtual Access</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{attendeesCount.toLocaleString()} Attending</p>
                          <p className="text-slate-400 mt-0.5">Developers, Creators & Speakers</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400 shrink-0">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Status</p>
                          <p className="text-slate-400 mt-0.5">Registration Active</p>
                        </div>
                      </div>
                    </div>

                    {/* Live Event Countdown */}
                    {countdown && (
                      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                          <Clock size={16} className="text-blue-400" />
                          <span>{countdown.ended ? "Event Concluded / Live Now" : "Event Starts In:"}</span>
                        </div>
                        {!countdown.ended && (
                          <div className="flex items-center gap-2 text-center">
                            <div className="bg-[#1e293b] border border-[#334155]/50 px-2.5 py-1.5 rounded-xl min-w-12">
                              <span className="text-sm font-bold text-white block">{countdown.days}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Days</span>
                            </div>
                            <span className="text-slate-500 font-bold">:</span>
                            <div className="bg-[#1e293b] border border-[#334155]/50 px-2.5 py-1.5 rounded-xl min-w-12">
                              <span className="text-sm font-bold text-white block">{countdown.hours}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</span>
                            </div>
                            <span className="text-slate-500 font-bold">:</span>
                            <div className="bg-[#1e293b] border border-[#334155]/50 px-2.5 py-1.5 rounded-xl min-w-12">
                              <span className="text-sm font-bold text-white block">{countdown.minutes}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mins</span>
                            </div>
                            <span className="text-slate-500 font-bold">:</span>
                            <div className="bg-[#1e293b] border border-[#334155]/50 px-2.5 py-1.5 rounded-xl min-w-12">
                              <span className="text-sm font-bold text-blue-400 block font-mono">{countdown.seconds}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Secs</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RSVP Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        variant={rsvpStatus === "going" ? "success" : "primary"}
                        size="md"
                        leftIcon={rsvpStatus === "going" ? <Check size={16} /> : <Check size={16} />}
                        onClick={() => handleRsvp("going")}
                        className="flex-1 sm:flex-none"
                      >
                        {rsvpStatus === "going" ? "Going" : "RSVP Going"}
                      </Button>
                      <Button
                        variant={rsvpStatus === "interested" ? "secondary" : "ghost"}
                        size="md"
                        leftIcon={<Star size={16} />}
                        onClick={() => handleRsvp("interested")}
                        className="flex-1 sm:flex-none"
                      >
                        {rsvpStatus === "interested" ? "Interested" : "Mark Interested"}
                      </Button>
                      <Button
                        variant={rsvpStatus === "declined" ? "danger" : "ghost"}
                        size="md"
                        onClick={() => handleRsvp("declined")}
                        className="flex-1 sm:flex-none text-slate-400"
                      >
                        Can&apos;t Go
                      </Button>
                      <Button
                        variant={reminderSet ? "secondary" : "ghost"}
                        size="md"
                        leftIcon={reminderSet ? <BellRing size={16} className="text-amber-400" /> : <Bell size={16} />}
                        onClick={handleToggleReminder}
                        className="flex-1 sm:flex-none border border-slate-700/60 text-slate-300 hover:text-white"
                      >
                        {reminderSet ? "Reminder On" : "Remind Me"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<Calendar size={16} className="text-blue-400" />}
                        onClick={handleAddToGoogleCalendar}
                        className="flex-1 sm:flex-none border border-slate-700/60 text-slate-300 hover:text-white"
                        title="Add event to Google Calendar"
                      >
                        Add to Google Cal
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* About & Details */}
                <Card className="border-[#1f2937] bg-[#111827]/80">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-400" />
                      About This Event
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {event.description || "No specific description has been provided for this event yet."}
                    </p>
                  </CardContent>
                </Card>

                {/* Host & Organizer Card */}
                {event.creator && (
                  <Card className="border-[#1f2937] bg-[#111827]/80">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={event.creator.avatar || event.creator.avatarUrl}
                          name={event.creator.name || "Organizer"}
                          size="lg"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">
                              {event.creator.name || event.creator.username || "Event Organizer"}
                            </h3>
                            <Badge variant="primary" size="sm" className="text-[10px]">
                              Host
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {event.creator.bio || "Event host and community coordinator"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {event.creator.id && (
                          <Link href={`/profile/${event.creator.id}`}>
                            <Button variant="ghost" size="sm" className="border border-[#1f2937] text-xs">
                              View Profile
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<MessageSquare size={14} />}
                          onClick={() => openChat({
                            id: event.creator.id || "organizer",
                            name: event.creator.name || "Organizer",
                            avatar: event.creator.avatar || "",
                          })}
                          className="text-xs text-blue-400 hover:text-white"
                        >
                          Message Host
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attendees Section */}
                <Card className="border-[#1f2937] bg-[#111827]/80">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-emerald-400" />
                        <h2 className="text-base font-bold text-white">Who&apos;s Going</h2>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {attendeesCount.toLocaleString()} RSVP&apos;d
                      </Badge>
                    </div>

                    {/* Attendee Search & Status Filter Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      <div className="relative flex-1">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search attendees by name..."
                          value={attendeeSearch}
                          onChange={(e) => setAttendeeSearch(e.target.value)}
                          className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
                        />
                        {attendeeSearch && (
                          <button
                            type="button"
                            onClick={() => setAttendeeSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-xs">
                        {(["ALL", "GOING", "INTERESTED"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setAttendeeFilter(filter)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                              attendeeFilter === filter
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
                            }`}
                          >
                            {filter.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtered Attendees Grid */}
                    {(() => {
                      const rawAttendees = (event.rsvps && event.rsvps.length > 0 ? event.rsvps : [
                        { user: { id: "att-1", name: "Alex Rivers", username: "alexr", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }, status: "GOING" },
                        { user: { id: "att-2", name: "Elena Rostova", username: "elena", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100" }, status: "GOING" },
                        { user: { id: "att-3", name: "David Kim", username: "davidk", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" }, status: "INTERESTED" },
                        { user: { id: "att-4", name: "Sarah Wilson", username: "sarahw", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }, status: "GOING" },
                        { user: { id: "att-5", name: "Marcus Brody", username: "marcusb", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" }, status: "INTERESTED" },
                      ]);

                      const filtered = rawAttendees.filter((item: any) => {
                        const status = (item.status || "GOING").toUpperCase();
                        if (attendeeFilter !== "ALL" && status !== attendeeFilter) return false;
                        if (!attendeeSearch.trim()) return true;
                        const q = attendeeSearch.toLowerCase();
                        const u = item.user || item;
                        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.username || "";
                        return name.toLowerCase().includes(q) || (u.username && u.username.toLowerCase().includes(q));
                      });

                      if (filtered.length === 0) {
                        return (
                          <p className="text-xs text-slate-500 py-4 text-center">
                            No attendees found matching &quot;{attendeeSearch}&quot;.
                          </p>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                          {filtered.map((item: any, idx: number) => {
                            const u = item.user || item;
                            const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.username || "Guest";
                            const isGoing = (item.status || "GOING").toUpperCase() === "GOING";

                            return (
                              <div
                                key={u.id || idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-[#1f2937]"
                              >
                                <Link href={`/profile/${u.id}`} className="flex items-center gap-2.5 min-w-0">
                                  <Avatar src={u.avatar} name={name} size="sm" />
                                  <div className="truncate">
                                    <p className="text-xs font-semibold text-white truncate hover:text-blue-400 transition-colors">
                                      {name}
                                    </p>
                                    <span className="text-[10px] text-slate-400 block truncate">@{u.username || "attendee"}</span>
                                  </div>
                                </Link>
                                <Badge
                                  variant={isGoing ? "success" : "secondary"}
                                  size="sm"
                                  className="text-[9px] px-1.5 py-0 shrink-0 capitalize"
                                >
                                  {isGoing ? "Going" : "Interested"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Event Discussions & Q&A */}
                <Card className="border-[#1f2937] bg-[#111827]/80">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-400" />
                        <h2 className="text-base font-bold text-white">Event Discussion & Q&A</h2>
                      </div>
                      <Badge variant="primary" size="sm">
                        {discussions.length} Posts
                      </Badge>
                    </div>

                    {/* Post Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-2.5 pt-1">
                      <Avatar
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                        name="You"
                        size="sm"
                      />
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Ask a question or share info with attendees..."
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newCommentText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 px-3"
                        >
                          <Send size={13} />
                        </Button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 pt-2">
                      {discussions.map((comm) => (
                        <div
                          key={comm.id}
                          className="p-3.5 rounded-xl bg-[#0f172a] border border-[#1f2937] flex items-start gap-3"
                        >
                          <Avatar src={comm.avatar} name={comm.author} size="sm" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white">{comm.author}</span>
                              <span className="text-[10px] text-slate-500">{comm.createdAt}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{comm.content}</p>
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => handleToggleLikeComment(comm.id)}
                                className={`flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
                                  comm.isLiked ? "text-rose-400" : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Heart
                                  size={12}
                                  className={comm.isLiked ? "fill-rose-400 text-rose-400" : ""}
                                />
                                <span>{comm.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Edit Event Modal */}
            <Dialog
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              title="Edit Event Details"
            >
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Location / Venue</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cover Image URL</label>
                  <input
                    type="url"
                    value={editForm.coverUrl}
                    onChange={(e) => setEditForm({ ...editForm, coverUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0f172a] border border-[#1f2937] text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2937]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!editForm.title.trim() || savingEdit}
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Dialog>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
