import axios from "axios";
import { useState, useEffect, useCallback } from "react";

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export interface UserInfo {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  website?: string;
  createdAt: string;
}

export interface UserProfile {
  user: UserInfo;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualConnections?: number;
}

export interface UserSuggestionsResult {
  users: UserSearchResult[];
  total: number;
}

export interface FollowToggleProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
}

/**
 * Fetches current user profile (GET /api/v1/users/me)
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const res = await axios.get(`${baseURL}/users/me`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Fetches user profile by ID (GET /api/v1/users/:id)
 */
export async function getUserById(userId: string): Promise<UserProfile> {
  const res = await axios.get(`${baseURL}/users/${userId}`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Fetches user profile by username (GET /api/v1/users/username/:username)
 */
export async function getUserByUsername(username: string): Promise<UserProfile> {
  const res = await axios.get(`${baseURL}/users/username/${username}`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Search users (GET /api/v1/users/search?q=...)
 */
export async function searchUsers(query: string, page = 1, pageSize = 20): Promise<any> {
  const res = await axios.get(`${baseURL}/users/search`, {
    params: { q: query, page, pageSize },
    withCredentials: true,
  });
  return res.data;
}

/**
 * Get user suggestions (GET /api/v1/users/suggestions)
 */
export async function getUserSuggestions(page = 1, pageSize = 20): Promise<UserSuggestionsResult> {
  const res = await axios.get(`${baseURL}/users/suggestions`, {
    params: { page, pageSize },
    withCredentials: true,
  });
  return res.data;
}

/**
 * Follow a user (POST /api/v1/users/:id/follow)
 */
export async function followUser(userId: string): Promise<any> {
  const res = await axios.post(`${baseURL}/users/${userId}/follow`, {}, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Unfollow a user (POST /api/v1/users/:id/unfollow)
 */
export async function unfollowUser(userId: string): Promise<any> {
  const res = await axios.post(`${baseURL}/users/${userId}/unfollow`, {}, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Block a user (POST /api/v1/users/:id/block)
 */
export async function blockUser(userId: string): Promise<any> {
  const res = await axios.post(`${baseURL}/users/${userId}/block`, {}, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * Unblock a user (POST /api/v1/users/:id/unblock)
 */
export async function unblockUser(userId: string): Promise<any> {
  const res = await axios.post(`${baseURL}/users/${userId}/unblock`, {}, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * React hook for user queries
 */
export function useUsers(endpoint?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async (customEndpoint?: string) => {
    const target = customEndpoint || endpoint;
    if (!target) {
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (target === "/me") {
        result = await getCurrentUser();
      } else if (target.startsWith("/username/")) {
        const username = target.replace("/username/", "");
        result = await getUserByUsername(username);
      } else if (target.startsWith("/suggestions")) {
        result = await getUserSuggestions();
      } else if (target.startsWith("/search")) {
        const urlParams = new URLSearchParams(target.split("?")[1] || "");
        const q = urlParams.get("q") || "";
        result = await searchUsers(q);
      } else {
        const id = target.replace(/^\//, "");
        result = await getUserById(id);
      }
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}