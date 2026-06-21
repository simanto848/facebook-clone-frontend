import { Bell, Bookmark, House, User, Compass, Users, UserPlus, Calendar } from "lucide-react";

export const LeftSidebarItems = [
  {
    label: "Home",
    href: "/",
    icon: House,
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