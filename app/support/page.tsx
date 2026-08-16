"use client";

import React, { useState } from "react";
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    category: "general",
    subject: "",
    message: "",
  });

  const faqs = [
    {
      question: "How do I change my password?",
      answer: "Navigate to Settings > Security tab, enter your current password, and fill out your new password with strength feedback.",
    },
    {
      question: "How do I control who sees my posts?",
      answer: "When creating a post, use the privacy selector button ('Public', 'Friends', 'Only Me') to set visibility.",
    },
    {
      question: "Can I download my personal profile data?",
      answer: "Yes, we support archive downloads. Go to Settings > Account > Download Info to request a data link.",
    },
    {
      question: "How do I block or unblock someone?",
      answer: "Go to Settings > Privacy > Blocked Accounts or visit the user's profile card to block or unblock.",
    },
    {
      question: "What is Two-Factor Authentication (2FA)?",
      answer: "2FA is an extra security layer that requires both your password and a verification code to sign in.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketData({ category: "general", subject: "", message: "" });
    }, 3000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
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
          <Card hover>
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

          <Card hover>
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

          <Card hover>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <HeartHandshake size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Safety Center</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Report community concerns.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* FAQ Accordion List */}
          <div className="col-span-12 md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen size={18} className="text-blue-400" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#1f2937] bg-[#0f172a]/50 overflow-hidden transition"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="flex w-full items-center justify-between p-3.5 text-left font-bold text-xs text-slate-200 hover:text-white transition"
                        >
                          <span>{faq.question}</span>
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
                  <EmptyState title="No matching questions" description="Try searching for a different keyword." />
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
