import {Bell, Bookmark, House, User} from "lucide-react"

export const LeftSidebarItems = [
    {
        label: "Home",
        href: "/",
        icon: House
    },
    {
        label: "Profile",
        href: "/profile",
        icon: User,
    },
    {
        label: "Messages",
        href: "/messages",
        icon:Bell,
    },
    {
        label: "Bookmarks",
        href: "/bookmarks",
        icon: Bookmark
    }
]