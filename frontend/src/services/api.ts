const BASE_URL = "https://swell-backend.onrender.com";

/**
 * @description Swell API 서비스 유틸리티
 */
export const api = {
  // 게시글 관련
  posts: {
    // 목록 조회
    get: async (page = 1, limit = 20) => {
      const response = await fetch(`${BASE_URL}/api/posts?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("게시글을 불러오는데 실패했습니다.");
      return response.json();
    },
    // 작성
    create: async (data: { content: string; hasVote?: boolean; userId?: string }) => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("게시글 작성에 실패했습니다.");
      return response.json();
    },
    // 반응 (좋아요 등)
    react: async (id: string, type: "like" | "dislike", userId: string) => {
      const response = await fetch(`${BASE_URL}/api/posts/${id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, userId }),
      });
      return response.json();
    },
  },

  // 댓글 관련
  comments: {
    // 작성
    create: async (postId: string, data: { content: string; userId: string; parentId?: number }) => {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("댓글 작성에 실패했습니다.");
      return response.json();
    },
  },

  // 알람 관련
  notifications: {
    get: async (userId: string) => {
      const response = await fetch(`${BASE_URL}/api/notifications?userId=${userId}`);
      return response.json();
    },
  },
};
