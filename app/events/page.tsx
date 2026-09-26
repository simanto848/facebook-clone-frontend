"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Calendar, MapPin, Users, Ticket, Check, Plus, Image as ImageIcon, Search, Share2, ExternalLink, Flame, ArrowUpDown, Download, Bell, BellRing } from "lucide-react";
import Image from "next/image";
import { eventService } from "@/services/eventService";
import {
  PageHeader,
  Tabs,
  Card,
  CardContent,
  Button,
  Badge,
  EmptyState,
  Loader,
  Dialog,
  Input,
} from "@/components/ui";

interface TechEvent {
  id: string;
  title: string;
  cover: string;
  date: string;
  location: string;
  category: "Hackathon" | "Meetup" | "Conference" | string;
  attendees: number;
  description: string;
}

const initialEvents: TechEvent[] = [
  {
    id: "e1",
    title: "NextJS Architecture Conf 2026",
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    date: "Oct 20-21, 2026",
    location: "San Francisco, CA & Online",
    category: "Conference",
    attendees: 2450,
    description: "Explore the new architectural patterns of React 19, Server Actions optimization, and Next.js compiler advancements.",
  },
  {
    id: "e2",
    title: "Tokyo Brutalist Hackathon",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600",
    date: "July 12-14, 2026",
    location: "Tokyo Shibuya Space",
    category: "Hackathon",
    attendees: 142,
    description: "Build rapid developer workflows using neo-brutalist and glassmorphism styling frameworks. 48-hour cash prizes.",
  },
  {
    id: "e3",
    title: "Seattle CSS & WebGL Layouts Meetup",
    cover: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600",
    date: "Aug 05, 2026",
    location: "Seattle Downtown Library",
    category: "Meetup",
    attendees: 85,
    description: "Join layouts engineers to discuss scroll-driven animations, CSS grid container queries, and WebGL rendering techniques.",
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<TechEvent[]>(initialEvents);
  const [rsvps, setRsvps] = useState<Record<string, "going" | "interested" | null>>({ e1: "interested" });
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "date" | "name">("popular");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("event_reminders");
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleReminder = (eventId: string) => {
    setReminders((prev) => {
      const updated = { ...prev, [eventId]: !prev[eventId] };
      try {
        localStorage.setItem("event_reminders", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleShareEvent = (e: TechEvent) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/events/${e.id}`;
      navigator.clipboard.writeText(url);
      setCopiedEventId(e.id);
      setTimeout(() => setCopiedEventId(null), 2000);
    }
  };

  const handleExportIcs = () => {
    const targetEvents = events.filter((e) => rsvps[e.id] === "going" || rsvps[e.id] === "interested");
    const listToExport = targetEvents.length > 0 ? targetEvents : filteredEvents;
    if (listToExport.length === 0) return;

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TechSphere//Events//EN",
      "CALSCALE:GREGORIAN",
    ];

    listToExport.forEach((ev) => {
      const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const eventDate = new Date(ev.date);
      const startStr = !isNaN(eventDate.getTime())
        ? eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : nowStr;

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}@techsphere.app`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${startStr}`,
        `SUMMARY:${ev.title.replace(/[,;]/g, " ")}`,
        `DESCRIPTION:${ev.description.replace(/[\n\r]/g, " ").replace(/[,;]/g, " ")}`,
        `LOCATION:${ev.location.replace(/[,;]/g, " ")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsLines.push("END:VCALENDAR");

    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tech-events-${new Date().toISOString().slice(0, 10)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Create Event Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Conference",
    location: "",
    startDate: "",
    endDate: "",
    isOnline: false,
    coverImage: "",
  });

  const fetchEventsFromBackend = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const fetched: TechEvent[] = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          cover: item.coverImage || item.coverUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
          date: item.startTime || item.startDate ? new Date(item.startTime || item.startDate).toLocaleDateString() : "Upcoming",
          location: item.location || "Online",
          category: item.category || "Meetup",
          attendees: item._count?.rsvps || (Array.isArray(item.rsvps) ? item.rsvps.length : 0),
          description: item.description || "",
        }));
        setEvents(fetched);
      }
    } catch (err) {
      console.error("Using local fallback events due to fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsFromBackend();
  }, []);

  const handleRsvp = async (eventId: string, status: "going" | "interested") => {
    const currentStatus = rsvps[eventId];
    const newStatus = currentStatus === status ? null : status;
    const prevEvents = [...events];

    setRsvps((prev) => ({
      ...prev,
      [eventId]: newStatus,
    }));

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        let delta = 0;
        if (newStatus === "going" && currentStatus !== "going") delta = 1;
        else if (currentStatus === "going" && newStatus !== "going") delta = -1;
        return {
          ...e,
          attendees: Math.max(0, e.attendees + delta),
        };
      })
    );

    try {
      if (newStatus) {
        await eventService.rsvpEvent(eventId, newStatus);
      } else {
        await eventService.rsvpEvent(eventId, "declined");
      }
    } catch (err) {
      console.error("RSVP error, rolling back:", err);
      setRsvps((prev) => ({
        ...prev,
        [eventId]: currentStatus,
      }));
      setEvents(prevEvents);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setCreateError("Event title is required");
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setCreateError("End date cannot be earlier than start date");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const startDateIso = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString();

      const endDateIso = formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined;

      const locationStr = formData.isOnline
        ? formData.location
          ? `Online - ${formData.location}`
          : "Online Stream"
        : formData.location || "San Francisco, CA";

      const created = await eventService.createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: locationStr,
        category: formData.category,
        startTime: startDateIso,
        endTime: endDateIso,
        coverUrl: formData.coverImage.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
      });

      const newEvent: TechEvent = {
        id: created.data?.id || created.id || `event-${Date.now()}`,
        title: formData.title.trim(),
        cover: formData.coverImage.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
        date: new Date(startDateIso).toLocaleDateString(),
        location: locationStr,
        category: formData.category,
        attendees: 1,
        description: formData.description.trim(),
      };

      setEvents((prev) => [newEvent, ...prev]);
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "Conference",
        location: "",
        startDate: "",
        endDate: "",
        isOnline: false,
        coverImage: "",
      });
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredEvents = () => {
    let list = events;

    if (activeFilter === "conference") {
      list = list.filter((e) => e.category.toLowerCase().includes("conference"));
    } else if (activeFilter === "hackathon") {
      list = list.filter((e) => e.category.toLowerCase().includes("hackathon"));
    } else if (activeFilter === "meetup") {
      list = list.filter((e) => e.category.toLowerCase().includes("meetup"));
    } else if (activeFilter === "workshop") {
      list = list.filter((e) => e.category.toLowerCase().includes("workshop"));
    } else if (activeFilter === "going") {
      list = list.filter((e) => rsvps[e.id] === "going");
    } else if (activeFilter === "interested") {
      list = list.filter((e) => rsvps[e.id] === "interested");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "popular") {
      list = [...list].sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      list = [...list].sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeA - timeB;
      });
    }

    return list;
  };

  const filteredEvents = getFilteredEvents();

  const filterTabs = [
    { id: "all", label: "All Events" },
    { id: "conference", label: "Conferences" },
    { id: "hackathon", label: "Hackathons" },
    { id: "meetup", label: "Meetups" },
    { id: "workshop", label: "Workshops" },
    { id: "going", label: "RSVP Going" },
    { id: "interested", label: "Interested" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <PageHeader
              title="Tech Events & Hackathons"
              description="Discover tech conferences, developer meetups, and code hackathons."
              icon={<Calendar size={22} />}
              badge={<Badge variant="primary">{filteredEvents.length} Events</Badge>}
              actions={
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    onClick={handleExportIcs}
                    title="Export events calendar (.ics)"
                  >
                    Export .ics
                  </Button>
                  <Button
                    leftIcon={<Plus size={16} />}
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Event
                  </Button>
                </div>
              }
            />

            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Search events by name, topic, venue, or location..."
                  leftIcon={<Search size={16} className="text-slate-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  clearable
                  className="bg-[#111827] border-[#1f2937]"
                />
              </div>

              {/* Quick Location / Keyword Filters & Match Status */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium">Quick locations:</span>
                  {["Online", "San Francisco", "Tokyo", "Seattle"].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSearchQuery(searchQuery === loc ? "" : loc)}
                      className={`px-2 py-0.5 rounded-md transition ${
                        searchQuery.toLowerCase() === loc.toLowerCase()
                          ? "bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40"
                          : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {searchQuery.trim() && (
                  <div className="flex items-center gap-1.5 font-medium text-slate-300 shrink-0">
                    <span>
                      Found <strong className="text-blue-400">{filteredEvents.length}</strong> matching events
                    </span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-rose-400 hover:underline ml-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Events", count: events.length },
                { id: "conference", label: "Conferences", count: events.filter((e) => e.category.toLowerCase().includes("conference")).length },
                { id: "hackathon", label: "Hackathons", count: events.filter((e) => e.category.toLowerCase().includes("hackathon")).length },
                { id: "meetup", label: "Meetups", count: events.filter((e) => e.category.toLowerCase().includes("meetup")).length },
                { id: "workshop", label: "Workshops", count: events.filter((e) => e.category.toLowerCase().includes("workshop")).length },
                { id: "going", label: "RSVP Going", count: events.filter((e) => rsvps[e.id] === "going").length },
                { id: "interested", label: "Interested", count: events.filter((e) => rsvps[e.id] === "interested").length },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    activeFilter === pill.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-[#111827] text-slate-400 hover:text-white hover:bg-[#1f2937] border border-[#1f2937]"
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeFilter === pill.id
                        ? "bg-white/20 text-white font-bold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort & Count Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                  <ArrowUpDown size={12} />
                  <span>Sort by:</span>
                </span>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    sortBy === "popular"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  <Flame size={12} className={sortBy === "popular" ? "text-amber-400 fill-amber-400" : ""} />
                  <span>Most Popular</span>
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    sortBy === "date"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  <Calendar size={12} />
                  <span>Date</span>
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    sortBy === "name"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  Alphabetical
                </button>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            {/* Events List Grid */}
            <div className="space-y-6 pt-2">
              {loading ? (
                <div className="py-16 text-center">
                  <Loader label="Loading tech events..." />
                </div>
              ) : filteredEvents.length === 0 ? (
                <EmptyState
                  icon={<Calendar size={36} className="text-slate-400" />}
                  title="No events found"
                  description="Try selecting a different filter category or search term."
                />
              ) : (
                filteredEvents.map((event) => {
                  const rsvpStatus = rsvps[event.id];

                  return (
                    <Card key={event.id} hover className="flex flex-col md:flex-row group overflow-hidden">
                      {/* Event Banner */}
                      <Link
                        href={`/events/${event.id}`}
                        className="relative h-48 md:h-auto md:w-56 overflow-hidden shrink-0 block"
                      >
                        <Image
                          src={event.cover}
                          fill
                          sizes="(max-width: 768px) 100vw, 224px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          alt={event.title}
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="glass">{event.category}</Badge>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {reminders[event.id] && (
                            <Badge variant="warning" size="sm" className="bg-amber-500/90 text-black font-semibold flex items-center gap-1 shadow-sm backdrop-blur-sm">
                              <BellRing size={10} className="animate-pulse" />
                              <span>Remind</span>
                            </Badge>
                          )}
                          {rsvpStatus && (
                            <Badge variant={rsvpStatus === "going" ? "success" : "primary"} size="sm">
                              {rsvpStatus === "going" ? "Going" : "Interested"}
                            </Badge>
                          )}
                        </div>
                      </Link>

                      {/* Event Details */}
                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <Link href={`/events/${event.id}`}>
                            <h3 className="font-bold text-base text-white hover:text-blue-400 transition cursor-pointer">
                              {event.title}
                            </h3>
                          </Link>
                          <div className="flex flex-col gap-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-blue-400 shrink-0" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-blue-400 shrink-0" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users size={13} className="text-blue-400 shrink-0" />
                              <span>{event.attendees.toLocaleString()} attending</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[#1f2937]/60">
                          <Button
                            variant={rsvpStatus === "going" ? "success" : "primary"}
                            size="sm"
                            className="flex-1"
                            leftIcon={rsvpStatus === "going" ? <Check size={14} /> : <Ticket size={14} />}
                            onClick={() => handleRsvp(event.id, "going")}
                          >
                            {rsvpStatus === "going" ? "Going" : "RSVP Going"}
                          </Button>
                          <Button
                            variant={rsvpStatus === "interested" ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1"
                            leftIcon={rsvpStatus === "interested" ? <Check size={14} /> : undefined}
                            onClick={() => handleRsvp(event.id, "interested")}
                          >
                            {rsvpStatus === "interested" ? "Interested" : "Mark Interested"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`px-2.5 transition ${
                              reminders[event.id]
                                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-slate-400 hover:text-white"
                            }`}
                            onClick={() => handleToggleReminder(event.id)}
                            title={reminders[event.id] ? "Reminder active (click to remove)" : "Set event notification reminder"}
                          >
                            {reminders[event.id] ? <BellRing size={14} className="text-amber-400" /> : <Bell size={14} />}
                          </Button>
                          <Link
                            href={`/events/${event.id}`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl border border-[#1f2937] bg-[#0f172a] hover:bg-[#1f2937] text-slate-300 transition"
                            title="View Event Details"
                          >
                            <ExternalLink size={13} />
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2.5 text-slate-400 hover:text-white"
                            onClick={() => handleShareEvent(event)}
                            title="Share event link"
                          >
                            {copiedEventId === event.id ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* CREATE EVENT MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Host a New Tech Event"
        description="Fill in the event details to publish to the community."
        size="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 pt-2">
          {createError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
              {createError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Event Title *</label>
            <Input
              required
              placeholder="e.g., Global Rust & WebAssembly Summit 2026"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="Conference">Conference</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Meetup">Meetup</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div className="space-y-1.5 flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData((p) => ({ ...p, isOnline: e.target.checked }))}
                  className="rounded border-[#334155] bg-[#1e293b] text-blue-600 focus:ring-blue-500"
                />
                <span>Virtual / Online Event (Zoom/YouTube)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Start Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">End Date & Time (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {formData.isOnline ? "Online Platform / Meeting Link (Optional)" : "Physical Location / Venue"}
            </label>
            <Input
              placeholder={formData.isOnline ? "e.g., Zoom / Discord Live / YouTube Stream" : "e.g., San Francisco, CA or Tokyo Shibuya"}
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Cover Image URL</label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={(e) => setFormData((p) => ({ ...p, coverImage: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Describe agenda, keynote speakers, and what attendees will learn..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2937]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Publishing..." : "Publish Event"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
