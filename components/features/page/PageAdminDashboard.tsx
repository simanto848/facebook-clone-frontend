"use client";

import React from "react";
import { Flag, Eye, Heart, Users, FileText, Plus } from "lucide-react";
import { Card, CardContent, Badge, Button, DataTable, type Column } from "@/components/ui";

interface ArticleItem {
  id: string;
  title: string;
  views: number;
  publishedAt: string;
}

const sampleArticles: ArticleItem[] = [
  { id: "a1", title: "React 19 Server Components Masterclass", views: 12400, publishedAt: "3 days ago" },
  { id: "a2", title: "Glassmorphism UI Design Token System", views: 8900, publishedAt: "1 week ago" },
];

export function PageAdminDashboard() {
  const columns: Column<ArticleItem>[] = [
    {
      key: "title",
      header: "Published Article",
      sortable: true,
      cell: (row) => <span className="text-xs font-bold text-white">{row.title}</span>,
    },
    {
      key: "views",
      header: "Total Views",
      sortable: true,
      cell: (row) => <Badge variant="primary">{row.views.toLocaleString()} Views</Badge>,
    },
    {
      key: "publishedAt",
      header: "Date",
      sortable: true,
      cell: (row) => <span className="text-[11px] text-slate-400">{row.publishedAt}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400">
            <Flag size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Brand Page Analytics</h2>
            <p className="text-xs text-slate-400">Performance overview for your official published page</p>
          </div>
        </div>

        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Page Followers</p>
              <p className="text-2xl font-extrabold text-white mt-1">42,300</p>
            </div>
            <Users size={22} className="text-blue-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Reach</p>
              <p className="text-2xl font-extrabold text-white mt-1">189.4k</p>
            </div>
            <Eye size={22} className="text-green-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Article Engagement</p>
              <p className="text-2xl font-extrabold text-white mt-1">94.2%</p>
            </div>
            <FileText size={22} className="text-purple-400" />
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={sampleArticles} pageSize={5} />
    </div>
  );
}
