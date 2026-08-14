"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Calendar, MapPin, Users, Ticket, Check } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const fetchEventsFromBackend = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      const items = res.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const fetched: TechEvent[] = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          cover: item.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
          date: item.startDate ? new Date(item.startDate).toLocaleDateString() : "Upcoming",
          location: item.location || "Online",
          category: item.category || "Meetup",
          attendees: item._count?.rsvps || 0,
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
    const current = rsvps[eventId];
    const newStatus = current === status ? null : status;
    setRsvps((prev) => ({
      ...prev,
      [eventId]: newStatus,
    }));

    if (newStatus) {
      try {
        await eventService.rsvpEvent(eventId, newStatus.toUpperCase() as any);
      } catch (err) {
        console.error("RSVP error:", err);
      }
    }
  };

  const getFilteredEvents = () => {
    switch (activeFilter) {
      case "hackathons":
        return events.filter((e) => e.category.toLowerCase().includes("hackathon"));
      case "meetups":
        return events.filter((e) => e.category.toLowerCase().includes("meetup"));
      case "going":
        return events.filter((e) => rsvps[e.id] === "going");
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const filterTabs = [
    { id: "all", label: "All Events" },
    { id: "hackathons", label: "Hackathons" },
    { id: "meetups", label: "Meetups" },
    { id: "going", label: "RSVPs (Going)" },
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
            />

            <Tabs
              tabs={filterTabs}
              activeTab={activeFilter}
              onChange={setActiveFilter}
              variant="line"
            />

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
                  const displayAttendees = rsvpStatus === "going" ? event.attendees + 1 : event.attendees;

                  return (
                    <Card key={event.id} hover className="flex flex-col md:flex-row group">
                      {/* Event Banner */}
                      <div className="relative h-48 md:h-auto md:w-56 overflow-hidden shrink-0">
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
                      </div>

                      {/* Event Details */}
                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-base text-white hover:text-blue-400 transition cursor-pointer">
                            {event.title}
                          </h3>
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
                              <span>{displayAttendees.toLocaleString()} attending</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
                          <Button
                            variant={rsvpStatus === "going" ? "success" : "primary"}
                            fullWidth
                            size="sm"
                            leftIcon={rsvpStatus === "going" ? <Check size={14} /> : <Ticket size={14} />}
                            onClick={() => handleRsvp(event.id, "going")}
                          >
                            {rsvpStatus === "going" ? "Going" : "RSVP Going"}
                          </Button>
                          <Button
                            variant={rsvpStatus === "interested" ? "secondary" : "ghost"}
                            fullWidth
                            size="sm"
                            leftIcon={rsvpStatus === "interested" ? <Check size={14} /> : undefined}
                            onClick={() => handleRsvp(event.id, "interested")}
                          >
                            Interested
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
    </div>
  );
}
