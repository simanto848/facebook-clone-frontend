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
} from "lucide-react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { eventService } from "@/services/eventService";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Avatar,
  Loader,
  EmptyState,
} from "@/components/ui";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [event, setEvent] = useState<any>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "interested" | "declined" | null>(null);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
    } else if (prevStatus === "going" && newStatus !== "going") {
      setAttendeesCount((c) => Math.max(0, c - 1));
    }

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
              </div>
            )}
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
