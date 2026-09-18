import { Bell, Bookmark, House, User, Compass, Users, UserPlus, Calendar, Flag, Film, MessageSquare } from "lucide-react";

export const LeftSidebarItems = [
  {
    label: "Home",
    href: "/",
    icon: House,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Reels",
    href: "/reels",
    icon: Film,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Groups",
    href: "/groups",
    icon: Users,
  },
  {
    label: "Pages",
    href: "/pages",
    icon: Flag,
  },
  {
    label: "Connections",
    href: "/connections",
    icon: UserPlus,
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
];