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
  Check 
} from "lucide-react";

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    category: "general",
    subject: "",
    message: ""
  });

  const faqs = [
    {
      question: "How do I change my password?",
      answer: "Navigate to your Profile menu in the top right, select 'Privacy & Security', go to the 'Security' tab, and fill out the 'Update Password' form."
    },
    {
      question: "How do I control who sees my posts?",
      answer: "When creating a post, use the privacy selector button (e.g., 'Public', 'Friends', 'Only Me') to determine your post's visibility before publishing."
    },
    {
      question: "Can I download my personal profile data?",
      answer: "Yes, we support full archive downloads. Go to Settings > Account > Download Info to request a secure link containing your data."
    },
    {
      question: "How do I block or report someone?",
      answer: "Go to the user's profile page, click on the options menu (three dots icon), and select 'Block User' or 'Report Profile'."
    },
    {
      question: "What is Two-Factor Authentication?",
      answer: "Two-Factor Authentication (2FA) is an extra security layer that requires both your password and a verification code sent to your phone/authenticator app to log in."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
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
    <div className="min-h-screen bg-[#0b0f19] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header section with search */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#1f2937] bg-gradient-to-r from-blue-600/10 via-teal-600/5 to-transparent p-8 text-center sm:p-12">
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HelpCircle size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">How can we help?</h1>
            <p className="mt-2 text-sm text-slate-400">
              Search our FAQs or submit a support ticket to get in touch with our team.
            </p>
            
            {/* Search Input */}
            <div className="relative mt-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, and questions..."
                className="w-full h-12 pl-12 pr-4 bg-[#111827]/80 border border-[#1f2937] rounded-xl text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition duration-150 text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
          <div className="absolute left-0 top-0 -ml-12 -mt-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl border border-[#1f2937] bg-[#111827]/40 hover:bg-[#111827]/80 hover:border-blue-500/35 transition group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20">
              <BookOpen size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Guides & Tutorials</h4>
              <p className="text-xs text-slate-400 mt-0.5">Learn using step-by-step guides.</p>
            </div>
          </a>
          
          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl border border-[#1f2937] bg-[#111827]/40 hover:bg-[#111827]/80 hover:border-purple-500/35 transition group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Terms & Policies</h4>
              <p className="text-xs text-slate-400 mt-0.5">Read our terms and guidelines.</p>
            </div>
          </a>

          <a href="#" className="flex items-center gap-4 p-5 rounded-2xl border border-[#1f2937] bg-[#111827]/40 hover:bg-[#111827]/80 hover:border-green-500/35 transition group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500/20">
              <HeartHandshake size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Safety Center</h4>
              <p className="text-xs text-slate-400 mt-0.5">Report safety concerns.</p>
            </div>
          </a>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* FAQ Accordion List */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-400" />
                Frequently Asked Questions
              </h3>
              
              {filteredFaqs.length > 0 ? (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div 
                        key={idx} 
                        className="rounded-xl border border-[#1f2937] bg-[#0b0f19]/30 overflow-hidden transition"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="flex w-full items-center justify-between p-4 text-left font-medium text-sm text-slate-200 hover:text-white transition"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>
                        
                        {isOpen && (
                          <div className="border-t border-[#1f2937] p-4 text-xs text-slate-400 leading-relaxed bg-[#0b0f19]/60">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No matching questions found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Support Ticket Form */}
          <div className="col-span-12 md:col-span-5">
            <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/60 backdrop-blur-md p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-400" />
                Submit a Request
              </h3>
              
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                    className="w-full h-11 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm appearance-none"
                  >
                    <option value="general" className="bg-[#111827]">General Inquiry</option>
                    <option value="account" className="bg-[#111827]">Account Issues</option>
                    <option value="billing" className="bg-[#111827]">Billing & Purchases</option>
                    <option value="bug" className="bg-[#111827]">Report a Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    placeholder="Brief summary of the issue"
                    required
                    className="w-full h-11 bg-[#0b0f19] border border-[#1f2937] rounded-xl px-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={ticketData.message}
                    onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                    placeholder="Provide details about your question or issue..."
                    required
                    className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 text-white outline-none focus:border-blue-500 transition duration-150 text-sm resize-none"
                  />
                </div>

                {ticketSubmitted ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium py-1">
                    <Check size={16} />
                    <span>Your ticket has been sent successfully!</span>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 rounded-xl transition duration-150 shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
