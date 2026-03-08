/**
 * @description Swell API 서비스 유틸리티 (Actual Backend Integration)
 */

import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const BASE_URL = "https://swell-backend.onrender.com";
const BASE_URL_FASTAPI = "https://swell-fastapi.onrender.com";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @description 타임아웃 기능이 포함된 fetch
 */
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("서버 응답 시간이 초과되었습니다. (서버가 깨어나는 중일 수 있습니다)");
    }
    throw error;
  }
};

export const api = {
  // 게시글 관련
  posts: {
    // 목록 조회
    get: async (page = 1, limit = 20, filter = "all") => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts?page=${page}&limit=${limit}&filter=${filter}`);
        const data = await response.json();
        // 백엔드 명세에 맞춰 데이터 파싱 (성공 시 data.posts 또는 data.data 확인 필요)
        return data.success ? data.posts || data.data || [] : [];
      } catch (error) {
        console.error("API Get Posts Error:", error);
        return [];
      }
    },
    // 작성
    create: async (data: {
      content: string;
      title?: string;
      category?: string;
      nickname?: string;
      hasVote?: boolean;
      userId: string;
    }) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 삭제
    delete: async (id: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts/${id}`, { method: "DELETE" });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 수정
    update: async (id: string, data: { title?: string; content: string }) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 반응 (좋아요/싫어요)
    react: async (id: string, type: "like" | "dislike", userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts/${id}/reaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 투표 (찬성/반대)
    vote: async (id: string, voteType: "agree" | "disagree", userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts/${id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType, userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 콘텐츠 필터링 (FASTAPI 연동 - 기존 유지)
    filter: async (text: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL_FASTAPI}/api/filter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        return await response.json();
      } catch (error) {
        return { is_blocked: false, action: "pass", message: "Filter service unavailable" };
      }
    },
  },

  // 댓글 관련
  comments: {
    // 작성
    create: async (postId: string, data: { content: string; userId: string; parentId?: number | string }) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 삭제
    delete: async (commentId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/comments/${commentId}`, { method: "DELETE" });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 댓글 좋아요
    like: async (commentId: string, userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/comments/${commentId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },

  // 알람 관련
  notifications: {
    get: async (userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/notifications?userId=${userId}`);
        const data = await response.json();
        return data.success ? data.notifications || data.data || [] : [];
      } catch (error) {
        return [];
      }
    },
  },

  // AI/STT 관련
  stt: {
    // 음성 인식 (오디오 파일 업로드)
    recognize: async (audioUri?: string) => {
      try {
        if (!audioUri) {
          // URI가 없으면 기본 데모용 호출 (또는 에러 처리)
          const response = await fetchWithTimeout(`${BASE_URL}/api/stt/recognize`, { method: "POST" });
          if (!response.ok) throw new Error("STT Server Error");
          return await response.json();
        }

        const formData = new FormData();
        // @ts-ignore
        formData.append("file", {
          uri: audioUri,
          name: "recording.m4a",
          type: "audio/m4a",
        });

        const response = await fetchWithTimeout(`${BASE_URL}/api/stt/recognize`, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (!response.ok) throw new Error("STT Server Error");
        return await response.json();
      } catch (error) {
        console.error("STT Recognize Error:", error);
        return { success: false, text: "음성 인식에 실패했습니다. 다시 시도해 주세요." };
      }
    },
    summarize: async (text: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/stt/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (!response.ok) throw new Error("STT Summarize Server Error");
        return await response.json();
      } catch (error) {
        console.error("STT Summarize Error:", error);
        return { success: false, summary: "AI 요약 서비스에 연결할 수 없습니다." };
      }
    },
  },

  // 인증 관련
  auth: {
    socialLogin: async (provider: string, code: string, redirectUri: string, codeVerifier?: string) => {
      try {
        console.log(`[API] socialLogin: ${provider}, code: ${code.substring(0, 5)}...`);
        const response = await fetchWithTimeout(`${BASE_URL}/api/auth/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, code, redirectUri, codeVerifier }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    register: async (data: {
      email?: string;
      nickname: string;
      gender: string;
      platform: string;
      birthYear: string;
      birthMonth: string;
      socialId?: string;
    }) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    verifyAdult: async (birthDate: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/auth/verify-adult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthDate }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },

  // 사용자/팔로우 관련
  users: {
    // 상대방 프로필 정보 조회
    getProfile: async (userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/profile/${userId}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 팔로우 토글 (Swagger: /api/users/follow 엔드포인트 하나로 팔로우/언팔로우 처리)
    toggleFollow: async (followerId: string, followingId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId, followingId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    follow: (followerId: string, followingId: string) => api.users.toggleFollow(followerId, followingId),
    unfollow: (followerId: string, followingId: string) => api.users.toggleFollow(followerId, followingId),
    syncProfile: async (userId: string, nickname: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, nickname }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 활동 기록 삭제
    deleteHistory: async (userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/${userId}/history`, {
          method: "DELETE",
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 탈퇴
    withdraw: async (userId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/${userId}`, {
          method: "DELETE",
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 푸시 토큰 업데이트
    updatePushToken: async (userId: string, token: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/push-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 사용자 차단/해제 (Swagger: /api/users/block)
    block: async (blockedId: string) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockedId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 차단한 사용자 목록 조회 (Swagger: /api/users/blocks)
    getBlocks: async () => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/users/blocks`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },

  // 신고 관련
  reports: {
    // 신고 접수 (Swagger: /api/reports)
    create: async (data: {
      targetType: "USER" | "POST" | "COMMENT";
      targetId: string;
      category: string;
      reason?: string;
    }) => {
      try {
        const response = await fetchWithTimeout(`${BASE_URL}/api/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },
};
