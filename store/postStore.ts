import { create } from "zustand";

export interface CommentType {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  replies?: CommentType[];
}

export interface PostType {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  visibility: "public" | "friends" | "private";
  type: "text" | "image" | "video" | "poll" | "shared" | "article";
  content: string;
  images?: string[];
  video?: {
    url: string;
    duration: string;
    views: number;
  };
  poll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    userVotedOptionId?: string;
  };
  sharedPost?: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar: string;
    };
    content: string;
    createdAt: string;
  };
  article?: {
    title: string;
    thumbnail: string;
    summary: string;
    url: string;
  };
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction?: string;
  comments: CommentType[];
  saved?: boolean;
  pinned?: boolean;
}

export interface StoryType {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  type: "text" | "image" | "video";
  content: string; // text or url
  createdAt: string;
  views: number;
  reactions: number;
}

interface PostState {
  posts: PostType[];
  stories: StoryType[];
  filter: "latest" | "popular" | "trending" | "following";
  setFilter: (filter: "latest" | "popular" | "trending" | "following") => void;
  createPost: (post: Omit<PostType, "id" | "createdAt" | "reactions" | "comments">) => void;
  deletePost: (id: string) => void;
  editPost: (id: string, content: string) => void;
  toggleSavePost: (id: string) => void;
  togglePinPost: (id: string) => void;
  addReaction: (postId: string, reactionType: string) => void;
  voteInPoll: (postId: string, optionId: string) => void;
  addComment: (postId: string, commentText: string) => void;
  addReplyToComment: (postId: string, commentId: string, replyText: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  editComment: (postId: string, commentId: string, newText: string) => void;
  addStory: (story: Omit<StoryType, "id" | "createdAt" | "views" | "reactions">) => void;
  viewStory: (storyId: string) => void;
  reactStory: (storyId: string) => void;
}

const initialPosts: PostType[] = [
  {
    id: "1",
    author: {
      name: "David Kim",
      username: "davidk",
      avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop",
    },
    createdAt: "5 hours ago",
    visibility: "public",
    type: "image",
    content: "Neon nights in the city. The contrast is unbelievable.",
    images: [
      "https://images.unsplash.com/photo-1778192391493-7436d746b128?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200",
    ],
    reactions: { like: 1200, love: 45, haha: 12, wow: 8, sad: 1, angry: 0 },
    userReaction: "like",
    comments: [
      {
        id: "c1",
        author: {
          name: "Sarah Chen",
          username: "sarahc",
          avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=1587&auto=format&fit=crop",
        },
        content: "Wow, this looks incredible! What camera did you use?",
        createdAt: "4 hours ago",
        likes: 12,
        replies: [
          {
            id: "c1_r1",
            author: {
              name: "David Kim",
              username: "davidk",
              avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop",
            },
            content: "Thanks Sarah! Shot this on a Sony A7R V.",
            createdAt: "3 hours ago",
            likes: 4,
          },
        ],
      },
    ],
    saved: false,
    pinned: false,
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=1587&auto=format&fit=crop",
    },
    createdAt: "2 hours ago",
    visibility: "public",
    type: "poll",
    content: "Which framework do you prefer for building modern web applications?",
    poll: {
      question: "Which framework do you prefer?",
      options: [
        { id: "opt_laravel", text: "Laravel", votes: 45 },
        { id: "opt_nestjs", text: "NestJS", votes: 62 },
        { id: "opt_django", text: "Django", votes: 28 },
        { id: "opt_springboot", text: "Spring Boot", votes: 34 },
      ],
    },
    reactions: { like: 120, love: 15, haha: 0, wow: 3, sad: 0, angry: 0 },
    comments: [],
    saved: true,
  },
  {
    id: "3",
    author: {
      name: "Alex Morgan",
      username: "alex",
      avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
    },
    createdAt: "Just now",
    visibility: "public",
    type: "text",
    content: "Today I learned about WebSockets. It makes real-time synchronization incredibly smooth and responsive! Can't wait to add it to more projects.",
    reactions: { like: 12, love: 4, haha: 0, wow: 1, sad: 0, angry: 0 },
    comments: [],
  },
  {
    id: "4",
    author: {
      name: "David Kim",
      username: "davidk",
      avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop",
    },
    createdAt: "1 day ago",
    visibility: "friends",
    type: "video",
    content: "Check out this beautiful cinemagraph I finished rendering.",
    video: {
      url: "https://assets.mixkit.co/videos/preview/mixkit-downtown-tokyo-by-night-14022-large.mp4",
      duration: "0:15",
      views: 2450,
    },
    reactions: { like: 412, love: 98, haha: 2, wow: 35, sad: 0, angry: 0 },
    comments: [],
  },
  {
    id: "5",
    author: {
      name: "Alex Morgan",
      username: "alex",
      avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
    },
    createdAt: "3 hours ago",
    visibility: "public",
    type: "shared",
    content: "Absolutely brilliant work on these neon cityscapes. Worth sharing!",
    sharedPost: {
      id: "1",
      author: {
        name: "David Kim",
        username: "davidk",
        avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop",
      },
      content: "Neon nights in the city. The contrast is unbelievable.",
      createdAt: "5 hours ago",
    },
    reactions: { like: 88, love: 12, haha: 0, wow: 2, sad: 0, angry: 0 },
    comments: [],
  },
  {
    id: "6",
    author: {
      name: "Elena Rostova",
      username: "elena",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
    },
    createdAt: "2 days ago",
    visibility: "public",
    type: "article",
    content: "Just published a comprehensive guide to understanding Next.js server actions and database security guidelines.",
    article: {
      title: "Mastering Next.js Server Actions: A Security-First Approach",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
      summary: "Next.js Server Actions simplify data mutation but open new security considerations. Learn how to secure input, implement rate-limiting, and authenticate requests efficiently.",
      url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations",
    },
    reactions: { like: 345, love: 72, haha: 1, wow: 12, sad: 0, angry: 0 },
    comments: [],
  },
];

const initialStories: StoryType[] = [
  {
    id: "s1",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=1587&auto=format&fit=crop",
    },
    type: "image",
    content: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500",
    createdAt: "10 hours ago",
    views: 45,
    reactions: 12,
  },
  {
    id: "s2",
    author: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=1170&auto=format&fit=crop",
    },
    type: "text",
    content: "Focusing on building deep product interfaces today ☕️",
    createdAt: "14 hours ago",
    views: 89,
    reactions: 32,
  },
];

// Recursive helper for searching/updating comments
const updateCommentInList = (
  comments: CommentType[],
  commentId: string,
  updater: (comment: CommentType) => CommentType
): CommentType[] => {
  return comments.map((c) => {
    if (c.id === commentId) {
      return updater(c);
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: updateCommentInList(c.replies, commentId, updater),
      };
    }
    return c;
  });
};

const removeCommentFromList = (comments: CommentType[], commentId: string): CommentType[] => {
  return comments
    .filter((c) => c.id !== commentId)
    .map((c) => {
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: removeCommentFromList(c.replies, commentId),
        };
      }
      return c;
    });
};

export const usePostStore = create<PostState>((set) => ({
  posts: initialPosts,
  stories: initialStories,
  filter: "latest",
  setFilter: (filter) => set({ filter }),
  createPost: (post) =>
    set((state) => {
      const newPost: PostType = {
        ...post,
        id: Math.random().toString(36).substring(7),
        createdAt: "Just now",
        reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        comments: [],
        saved: false,
        pinned: false,
      };
      return { posts: [newPost, ...state.posts] };
    }),
  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    })),
  editPost: (id, content) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, content } : p)),
    })),
  toggleSavePost: (id) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
    })),
  togglePinPost: (id) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    })),
  addReaction: (postId, reactionType) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;

        const reactions = { ...p.reactions };
        const prevReaction = p.userReaction;

        // If clicking the same reaction, remove it
        if (prevReaction === reactionType) {
          reactions[prevReaction as keyof typeof reactions] = Math.max(
            0,
            reactions[prevReaction as keyof typeof reactions] - 1
          );
          return { ...p, reactions, userReaction: undefined };
        }

        // Subtract from previous reaction if existed
        if (prevReaction) {
          reactions[prevReaction as keyof typeof reactions] = Math.max(
            0,
            reactions[prevReaction as keyof typeof reactions] - 1
          );
        }

        // Add to new reaction
        reactions[reactionType as keyof typeof reactions] =
          (reactions[reactionType as keyof typeof reactions] || 0) + 1;

        return { ...p, reactions, userReaction: reactionType };
      }),
    })),
  voteInPoll: (postId, optionId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId || !p.poll) return p;

        const options = p.poll.options.map((opt) => {
          let votes = opt.votes;
          // If this option is voted
          if (opt.id === optionId) {
            votes += 1;
          }
          // If user voted previously for a different option, decrement that option's vote
          if (p.poll?.userVotedOptionId === opt.id) {
            votes = Math.max(0, votes - 1);
          }
          return { ...opt, votes };
        });

        return {
          ...p,
          poll: {
            ...p.poll,
            options,
            userVotedOptionId: optionId,
          },
        };
      }),
    })),
  addComment: (postId, commentText) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const newComment: CommentType = {
          id: Math.random().toString(36).substring(7),
          author: {
            name: "Alex Morgan",
            username: "alex",
            avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
          },
          content: commentText,
          createdAt: "Just now",
          likes: 0,
          replies: [],
        };
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }),
    })),
  addReplyToComment: (postId, commentId, replyText) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;

        const newReply: CommentType = {
          id: Math.random().toString(36).substring(7),
          author: {
            name: "Alex Morgan",
            username: "alex",
            avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500",
          },
          content: replyText,
          createdAt: "Just now",
          likes: 0,
        };

        const updatedComments = updateCommentInList(p.comments, commentId, (comment) => ({
          ...comment,
          replies: [...(comment.replies || []), newReply],
        }));

        return {
          ...p,
          comments: updatedComments,
        };
      }),
    })),
  toggleLikeComment: (postId, commentId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;

        const updatedComments = updateCommentInList(p.comments, commentId, (comment) => {
          const userLiked = !comment.userLiked;
          return {
            ...comment,
            userLiked,
            likes: userLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
          };
        });

        return {
          ...p,
          comments: updatedComments,
        };
      }),
    })),
  deleteComment: (postId, commentId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: removeCommentFromList(p.comments, commentId),
        };
      }),
    })),
  editComment: (postId, commentId, newText) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const updatedComments = updateCommentInList(p.comments, commentId, (comment) => ({
          ...comment,
          content: newText,
        }));
        return {
          ...p,
          comments: updatedComments,
        };
      }),
    })),
  addStory: (story) =>
    set((state) => {
      const newStory: StoryType = {
        ...story,
        id: Math.random().toString(36).substring(7),
        createdAt: "Just now",
        views: 0,
        reactions: 0,
      };
      return { stories: [newStory, ...state.stories] };
    }),
  viewStory: (storyId) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? { ...s, views: s.views + 1 } : s)),
    })),
  reactStory: (storyId) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? { ...s, reactions: s.reactions + 1 } : s)),
    })),
}));
