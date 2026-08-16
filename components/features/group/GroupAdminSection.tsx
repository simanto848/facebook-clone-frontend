"use client";

import React, { useState } from "react";
import { Check, X, Shield, Users, Trash2 } from "lucide-react";
import { DataTable, Button, Badge, Avatar, type Column } from "@/components/ui";

interface MemberRequest {
  id: string;
  name: string;
  avatar: string;
  role: string;
  requestedAt: string;
}

const sampleRequests: MemberRequest[] = [
  { id: "r1", name: "David Kim", avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?w=100", role: "UI Designer", requestedAt: "2h ago" },
  { id: "r2", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?w=100", role: "Fullstack Dev", requestedAt: "Yesterday" },
];

export function GroupAdminSection() {
  const [requests, setRequests] = useState<MemberRequest[]>(sampleRequests);

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const columns: Column<MemberRequest>[] = [
    {
      key: "name",
      header: "Member Request",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <p className="text-xs font-bold text-white leading-tight">{row.name}</p>
            <p className="text-[10px] text-slate-400">{row.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "requestedAt",
      header: "Requested",
      sortable: true,
      cell: (row) => <span className="text-[11px] text-slate-400">{row.requestedAt}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="success" leftIcon={<Check size={13} />} onClick={() => handleAccept(row.id)}>
            Approve
          </Button>
          <Button size="sm" variant="ghost" leftIcon={<X size={13} />} onClick={() => handleDecline(row.id)}>
            Decline
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Guild Moderation Dashboard</h2>
            <p className="text-xs text-slate-400">Review pending member requests and manage guild access</p>
          </div>
        </div>
        <Badge variant="primary">{requests.length} Pending Requests</Badge>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        searchPlaceholder="Filter member requests..."
        pageSize={5}
      />
    </div>
  );
}
