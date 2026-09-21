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

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({ f1: true });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    category: "general",
    subject: "",
    message: "",
  });

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

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketData({ category: "general", subject: "", message: "" });
    }, 3000);
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
                          className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs text-slate-200 hover:text-white transition"
                        >
                          <div className="flex items-center gap-2 flex-1 pr-2">
                            <span>{faq.question}</span>
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
                          <div className="border-t border-[#1f2937] p-3.5 text-xs text-slate-400 leading-relaxed bg-[#0b0f19]">
                            {faq.answer}
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
                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold py-1">
                      <Check size={16} />
                      <span>Your ticket has been sent successfully!</span>
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
      </div>
    </div>
  );
}
