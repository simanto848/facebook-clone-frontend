import { Bell, Bookmark, House, User, Compass, Users, UserPlus, Calendar, Flag, Film } from "lucide-react";

export const LeftSidebarItems = [
  {
    label: "Home",
    href: "/",
    icon: House,
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
    icon: Bell,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
];