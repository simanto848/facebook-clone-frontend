"use client";

import React, { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Calendar, MapPin, Users, Ticket, Check, BellRing, Compass, Sparkles } from "lucide-react";
import Image from "next/image";

interface TechEvent {
  id: string;
  title: string;
  cover: string;
  date: string;
  location: string;
  category: "Hackathon" | "Meetup" | "Conference";
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
  const [events] = useState<TechEvent[]>(initialEvents);
  const [rsvps, setRsvps] = useState<Record<string, "going" | "interested" | null>>({ e1: "interested" });
  const [activeFilter, setActiveFilter] = useState<"all" | "hackathons" | "meetups" | "going">("all");

  const handleRsvp = (eventId: string, status: "going" | "interested") => {
    setRsvps((prev) => {
      const current = prev[eventId];
      return {
        ...prev,
        [eventId]: current === status ? null : status,
      };
    });
  };

  const getFilteredEvents = () => {
    switch (activeFilter) {
      case "hackathons":
        return events.filter((e) => e.category === "Hackathon");
      case "meetups":
        return events.filter((e) => e.category === "Meetup");
      case "going":
        return events.filter((e) => rsvps[e.id] === "going");
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
              <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                <Calendar size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tech Events & Hackathons</h1>
                <p className="text-xs text-slate-400">Discover meetups, conferences, and design sprint hackathons</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-[#1f2937]/60 flex gap-6">
              {[
                { id: "all", label: "All Events" },
                { id: "hackathons", label: "Hackathons" },
                { id: "meetups", label: "Meetups" },
                { id: "going", label: "RSVPs (Going)" },
              ].map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`
                      pb-3 px-1 text-xs font-bold transition-all relative border-b-2
                      ${isActive ? "border-blue-500 text-blue-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"}
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Events List Grid */}
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                  <p className="text-slate-400 font-semibold text-sm">No events found</p>
                  <p className="text-xs text-slate-500 max-w-xs">Try selecting a different filter category.</p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const rsvpStatus = rsvps[event.id];
                  const displayAttendees = rsvpStatus === "going" ? event.attendees + 1 : event.attendees;

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-xl flex flex-col md:flex-row group"
                    >
                      {/* Event Banner */}
                      <div className="relative h-48 md:h-auto md:w-56 overflow-hidden shrink-0">
                        <Image
                          src={event.cover}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          alt={event.title}
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold text-white border border-slate-700">
                          {event.category}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-base text-white hover:underline hover:cursor-pointer transition">
                            {event.title}
                          </h3>
                          <div className="flex flex-col gap-1 text-[11px] text-slate-400 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-blue-400" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-blue-400" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-blue-400" />
                              <span>{displayAttendees.toLocaleString()} attending</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed pt-2">{event.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleRsvp(event.id, "going")}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-lg ${
                              rsvpStatus === "going"
                                ? "bg-green-600 text-white shadow-green-600/10"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10"
                            }`}
                          >
                            {rsvpStatus === "going" ? (
                              <>
                                <Check size={14} /> Going
                              </>
                            ) : (
                              <>
                                <Ticket size={14} /> Going
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRsvp(event.id, "interested")}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold border transition ${
                              rsvpStatus === "interested"
                                ? "bg-slate-800 border-blue-500 text-blue-400"
                                : "bg-slate-800 border-[#1f2937] hover:bg-slate-700 text-slate-300"
                            }`}
                          >
                            {rsvpStatus === "interested" && <Check size={14} />}
                            <span>Interested</span>
                          </button>
                        </div>
                      </div>
                    </div>
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
