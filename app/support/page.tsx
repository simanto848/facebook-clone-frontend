"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  HeartHandshake,
  Send,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_review" | "resolved";
  createdAt: string;
}

const initialTickets: SupportTicket[] = [
  {
    id: "t1",
    ticketNumber: "TK-8492",
    category: "account",
    subject: "2FA authentication key backup inquiry",
    message: "Requested backup recovery codes for secondary hardware key.",
    priority: "medium",
    status: "in_review",
    createdAt: "2026-09-24T10:15:00.000Z",
  },
  {
    id: "t2",
    ticketNumber: "TK-7310",
    category: "bug",
    subject: "WebGL canvas rendering flicker in Safari",
    message: "Minor canvas texture flicker on Retina display when toggling dark mode.",
    priority: "low",
    status: "resolved",
    createdAt: "2026-09-20T14:30:00.000Z",
  },
];

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSupportTab, setActiveSupportTab] = useState<"knowledgebase" | "tickets">("knowledgebase");
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({ f1: true });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "in_review" | "resolved">("all");
  const [ticketData, setTicketData] = useState({
    category: "general",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    subject: "",
    message: "",
  });
  const [faqFeedback, setFaqFeedback] = useState<Record<string, "yes" | "no">>({});

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("faq_feedback_ratings");
      if (stored) {
        setFaqFeedback(JSON.parse(stored));
      }
      const storedTickets = localStorage.getItem("support_tickets_list");
      if (storedTickets) {
        setTickets(JSON.parse(storedTickets));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFeedback = (faqId: string, rating: "yes" | "no") => {
    setFaqFeedback((prev) => {
      const updated = { ...prev, [faqId]: rating };
      try {
        localStorage.setItem("faq_feedback_ratings", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-blue-500/30 text-blue-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const faqs = [
    {
      id: "f1",
      category: "account",
      categoryLabel: "Account & Security",
      question: "How do I change my password?",
      answer: "Navigate to Settings > Security tab, enter your current password, and fill out your new password with strength feedback.",
    },
    {
      id: "f2",
      category: "privacy",
      categoryLabel: "Privacy & Sharing",
      question: "How do I control who sees my posts?",
      answer: "When creating a post, use the privacy selector button ('Public', 'Friends', 'Only Me') to set visibility.",
    },
    {
      id: "f3",
      category: "data",
      categoryLabel: "Data & Storage",
      question: "Can I download my personal profile data?",
      answer: "Yes, we support instant archive downloads. Go to Settings > Account > Download Info to export your profile, posts, bookmarks, and activity.",
    },
    {
      id: "f4",
      category: "privacy",
      categoryLabel: "Privacy & Sharing",
      question: "How do I block or unblock someone?",
      answer: "Go to Settings > Privacy > Blocked Accounts or visit the user's profile card to block or unblock.",
    },
    {
      id: "f5",
      category: "account",
      categoryLabel: "Account & Security",
      question: "What is Two-Factor Authentication (2FA)?",
      answer: "2FA is an extra security layer that requires both your password and a verification code to sign in.",
    },
    {
      id: "f6",
      category: "general",
      categoryLabel: "General",
      question: "How do community guilds and groups work?",
      answer: "Explore developer and designer communities under the Guilds & Groups Hub, join discussions, share posts, or create your own community.",
    },
  ];

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "account", label: "Account & Security" },
    { id: "privacy", label: "Privacy & Sharing" },
    { id: "data", label: "Data & Storage" },
    { id: "general", label: "General" },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== "all" && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAll = () => {
    const allOpen = filteredFaqs.every((f) => openFaqIds[f.id]);
    if (allOpen) {
      setOpenFaqIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredFaqs.forEach((f) => {
        next[f.id] = true;
      });
      setOpenFaqIds(next);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;

    const newTicket: SupportTicket = {
      id: "t_" + Date.now(),
      ticketNumber: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketData.category,
      subject: ticketData.subject.trim(),
      message: ticketData.message.trim(),
      priority: ticketData.priority,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      try {
        localStorage.setItem("support_tickets_list", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketData({ category: "general", priority: "medium", subject: "", message: "" });
    }, 3000);
  };

  const handleToggleTicketStatus = (ticketId: string) => {
    setTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== ticketId) return t;
        const nextStatus: "open" | "in_review" | "resolved" =
          t.status === "resolved" ? "open" : "resolved";
        return { ...t, status: nextStatus };
      });
      try {
        localStorage.setItem("support_tickets_list", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="How can we help you?"
          description="Search our developer knowledgebase guides or submit a support ticket to get in touch with our team."
          icon={<HelpCircle size={24} className="text-blue-400" />}
          badge={<Badge variant="primary">Help Desk</Badge>}
        >
          <Input
            placeholder="Search guides, tutorials, and support articles..."
            leftIcon={<Search size={18} />}
            clearable
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#111827] border-[#1f2937]"
          />
        </PageHeader>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
          <button
            onClick={() => setActiveSupportTab("knowledgebase")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSupportTab === "knowledgebase"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            <BookOpen size={14} />
            <span>Help Center & FAQ</span>
          </button>
          <button
            onClick={() => setActiveSupportTab("tickets")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeSupportTab === "tickets"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
            }`}
          >
            <MessageSquare size={14} />
            <span>My Support Tickets</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {tickets.filter((t) => t.status !== "resolved").length} Active
            </span>
          </button>
        </div>

        {activeSupportTab === "tickets" ? (
          /* Live Ticket Priority and Status Tracker */
          <div className="space-y-6 animate-in fade-in">
            {/* Tracker Header & Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-[#1f2937]">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" />
                  Live Support Tickets & Incident Status
                </h3>
                <p className="text-xs text-slate-400">
                  Track your submitted inquiries, ticket response priorities, and engineering status.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSupportTab("knowledgebase")}
                leftIcon={<Send size={13} />}
                className="shrink-0 text-xs"
              >
                New Request
              </Button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Tickets", count: tickets.length },
                { id: "open", label: "Open", count: tickets.filter((t) => t.status === "open").length },
                { id: "in_review", label: "In Review", count: tickets.filter((t) => t.status === "in_review").length },
                { id: "resolved", label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setTicketStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    ticketStatusFilter === pill.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      ticketStatusFilter === pill.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Ticket Cards List */}
            {tickets.filter((t) => ticketStatusFilter === "all" || t.status === ticketStatusFilter).length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={36} className="text-slate-400" />}
                title="No support tickets in this view"
                description={
                  ticketStatusFilter === "all"
                    ? "You haven't submitted any support requests yet. Click 'New Request' to get started."
                    : `No tickets currently match the "${ticketStatusFilter.replace('_', ' ')}" status.`
                }
              />
            ) : (
              <div className="space-y-4">
                {tickets
                  .filter((t) => ticketStatusFilter === "all" || t.status === ticketStatusFilter)
                  .map((t) => (
                    <Card key={t.id} hover className="border-[#1f2937] bg-[#111827]/70">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                              {t.ticketNumber}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(t.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Priority Badge */}
                            <Badge
                              variant={
                                t.priority === "urgent"
                                  ? "danger"
                                  : t.priority === "high"
                                  ? "warning"
                                  : t.priority === "medium"
                                  ? "primary"
                                  : "secondary"
                              }
                              size="sm"
                              className="capitalize"
                            >
                              {t.priority} Priority
                            </Badge>
                            {/* Status Badge */}
                            <Badge
                              variant={
                                t.status === "resolved"
                                  ? "success"
                                  : t.status === "in_review"
                                  ? "warning"
                                  : "primary"
                              }
                              size="sm"
                              className="flex items-center gap-1.5"
                            >
                              {t.status === "open" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                              {t.status === "in_review" && <Clock size={10} />}
                              {t.status === "resolved" && <CheckCircle2 size={10} />}
                              <span className="capitalize">{t.status.replace("_", " ")}</span>
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white">{t.subject}</h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{t.message}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/70 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Tag size={12} className="text-slate-500" />
                            <span className="capitalize">Category: {t.category}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={t.status === "resolved" ? "secondary" : "ghost"}
                            onClick={() => handleToggleTicketStatus(t.id)}
                            className={t.status === "resolved" ? "text-slate-300 text-xs" : "text-emerald-400 hover:text-emerald-300 text-xs"}
                          >
                            {t.status === "resolved" ? "Reopen Ticket" : "Mark as Resolved"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Resources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card hover className="cursor-pointer" onClick={() => setSelectedCategory("general")}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Guides & Tutorials</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Learn using step-by-step guides.</p>
                  </div>
                </CardContent>
              </Card>

          <Link href="/privacy" className="block">
            <Card hover className="h-full">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Terms & Policies</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Read our terms and guidelines.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings" className="block">
            <Card hover className="h-full">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Safety Center</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Report concerns and block accounts.</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* FAQ Accordion List */}
          <div className="col-span-12 md:col-span-7 space-y-3">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen size={18} className="text-blue-400" />
                  Frequently Asked Questions
                </CardTitle>
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="text-xs text-blue-400 hover:text-blue-300 transition font-medium self-start sm:self-auto"
                >
                  {filteredFaqs.every((f) => openFaqIds[f.id]) ? "Collapse All" : "Expand All"}
                </button>
              </CardHeader>

              {/* Category Filter Chips */}
              <div className="px-5 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-[#111827] text-slate-300 border border-[#1f2937] hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <CardContent className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = !!openFaqIds[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 overflow-hidden transition"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1 pr-2">
                            <span>{highlightText(faq.question, searchQuery)}</span>
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {faq.categoryLabel}
                            </span>
                          </div>
                          {isOpen ? (
                            <ChevronUp size={16} className="text-blue-400 shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="border-t border-[#1f2937] p-3.5 text-xs text-slate-300 leading-relaxed bg-[#0b0f19] space-y-3">
                            <p>{highlightText(faq.answer, searchQuery)}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                              <span>Was this answer helpful?</span>
                              {faqFeedback[faq.id] ? (
                                <span className="text-emerald-400 font-medium flex items-center gap-1">
                                  <Check size={12} /> Thank you for your feedback!
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(faq.id, "yes")}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 transition cursor-pointer"
                                  >
                                    <ThumbsUp size={11} />
                                    <span>Yes</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(faq.id, "no")}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition cursor-pointer"
                                  >
                                    <ThumbsDown size={11} />
                                    <span>No</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title="No matching questions" description="Try selecting a different category or clearing search." />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Support Ticket Form */}
          <div className="col-span-12 md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare size={18} className="text-purple-400" />
                  Submit a Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <Select
                    label="Category"
                    value={ticketData.category}
                    onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                    options={[
                      { label: "General Inquiry", value: "general" },
                      { label: "Account Issues", value: "account" },
                      { label: "Billing & Purchases", value: "billing" },
                      { label: "Report a Bug", value: "bug" },
                    ]}
                  />

                  <Select
                    label="Priority Level"
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value as any })}
                    options={[
                      { label: "Low Priority", value: "low" },
                      { label: "Medium Priority", value: "medium" },
                      { label: "High Priority", value: "high" },
                      { label: "Urgent Priority", value: "urgent" },
                    ]}
                  />

                  <Input
                    label="Subject"
                    placeholder="Brief summary of the issue"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    required
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Description</label>
                    <textarea
                      rows={4}
                      value={ticketData.message}
                      onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                      placeholder="Provide details about your question or issue..."
                      className="w-full bg-[#111827] border border-[#374151] rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  {ticketSubmitted && (
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Check size={16} />
                        <span>Your ticket has been sent and queued!</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveSupportTab("tickets")}
                        className="text-[11px] self-start"
                      >
                        View in Live Ticket Tracker ({tickets.length})
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    type="submit"
                    leftIcon={<Send size={14} />}
                  >
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
