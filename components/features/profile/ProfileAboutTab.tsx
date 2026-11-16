import React from "react";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export interface ProfileAboutUser {
  username?: string;
  bio?: string;
  headline?: string;
  role?: string;
  location?: string;
  website?: string;
  createdAt?: string | Date;
}

export interface ProfileAboutTabProps {
  user: ProfileAboutUser;
  className?: string;
}

export function ProfileAboutTab({ user, className = "" }: ProfileAboutTabProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview / Bio */}
      <Card className="border-[#1f2937] bg-[#111827]">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            About @{user.username}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {user.bio ||
              "No biography added yet. This developer prefers to let their code speak."}
          </p>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work & Education */}
        <Card className="border-[#1f2937] bg-[#111827]">
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Work & Education
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Briefcase size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    {user.headline || user.role || "Software Engineer"}
                  </p>
                  <p className="text-[11px] text-slate-400">TechSphere Community</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap
                  size={16}
                  className="text-emerald-400 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Computer Science & Systems
                  </p>
                  <p className="text-[11px] text-slate-400">Class of 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Web Info */}
        <Card className="border-[#1f2937] bg-[#111827]">
          <CardContent className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contact & Social
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-rose-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  {user.location || "San Francisco, CA"}
                </span>
              </div>
              {user.website ? (
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-sky-400 shrink-0" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline truncate"
                  >
                    {user.website}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-sky-400 shrink-0" />
                  <span className="text-xs text-slate-400">
                    techsphere.io/{user.username}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Joined{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })
                    : "March 2024"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileAboutTab;
